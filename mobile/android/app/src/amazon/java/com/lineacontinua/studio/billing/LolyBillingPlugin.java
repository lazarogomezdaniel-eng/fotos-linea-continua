package com.lineacontinua.studio.billing;

import android.util.Log;

import com.amazon.device.iap.PurchasingListener;
import com.amazon.device.iap.PurchasingService;
import com.amazon.device.iap.model.FulfillmentResult;
import com.amazon.device.iap.model.Product;
import com.amazon.device.iap.model.ProductDataResponse;
import com.amazon.device.iap.model.PurchaseResponse;
import com.amazon.device.iap.model.PurchaseUpdatesResponse;
import com.amazon.device.iap.model.Receipt;
import com.amazon.device.iap.model.RequestId;
import com.amazon.device.iap.model.UserDataResponse;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.Map;

@CapacitorPlugin(name = "LolyBilling")
public class LolyBillingPlugin extends Plugin implements PurchasingListener {

    private static final String TAG = "LolyBillingAmazon";
    public static final String SKU_PRO = "lolyline_pro";

    private boolean isInitialized = false;
    private boolean hasSyncedFromStore = false;
    private boolean isProUnlocked = false;
    private boolean accumFoundPro = false;
    private String localizedPrice = "";
    private String productTitle = "LolyLine Pro";
    private String productDescription = "";

    private PluginCall pendingPurchaseCall = null;
    private PluginCall pendingRestoreCall = null;

    @Override
    public void load() {
        super.load();
        ensureRegistered();
    }

    private void ensureRegistered() {
        if (!isInitialized && getContext() != null) {
            PurchasingService.registerListener(getContext(), this);
            isInitialized = true;
            Log.d(TAG, "Amazon PurchasingService registered.");
            PurchasingService.getUserData();
            PurchasingService.getProductData(Collections.singleton(SKU_PRO));
            accumFoundPro = false;
            PurchasingService.getPurchaseUpdates(true);
        }
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        boolean alreadyRegistered = isInitialized;
        ensureRegistered();
        if (alreadyRegistered) {
            PurchasingService.getProductData(Collections.singleton(SKU_PRO));
            accumFoundPro = false;
            PurchasingService.getPurchaseUpdates(true);
        }

        JSObject ret = new JSObject();
        ret.put("store", "amazon");
        ret.put("syncedFromStore", hasSyncedFromStore);
        if (hasSyncedFromStore) {
            ret.put("isPro", isProUnlocked);
        }
        ret.put("price", localizedPrice);
        call.resolve(ret);
    }

    @PluginMethod
    public void getProductInfo(PluginCall call) {
        ensureRegistered();
        PurchasingService.getProductData(Collections.singleton(SKU_PRO));
        JSObject ret = new JSObject();
        ret.put("sku", SKU_PRO);
        ret.put("price", localizedPrice);
        ret.put("title", productTitle);
        ret.put("description", productDescription);
        ret.put("isPro", isProUnlocked);
        call.resolve(ret);
    }

    @PluginMethod
    public void purchasePro(PluginCall call) {
        ensureRegistered();
        if (pendingPurchaseCall != null) {
            call.reject("A purchase is already in progress.");
            return;
        }
        pendingPurchaseCall = call;
        RequestId requestId = PurchasingService.purchase(SKU_PRO);
        Log.d(TAG, "Amazon purchase initiated for " + SKU_PRO + ", requestId=" + requestId);
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        ensureRegistered();
        if (pendingRestoreCall != null) {
            call.reject("Restore is already in progress.");
            return;
        }
        pendingRestoreCall = call;
        accumFoundPro = false;
        PurchasingService.getPurchaseUpdates(true);
    }

    // -------------------------------------------------------------------------
    // Amazon PurchasingListener Callbacks
    // -------------------------------------------------------------------------

    @Override
    public void onUserDataResponse(UserDataResponse response) {
        if (response != null && response.getRequestStatus() == UserDataResponse.RequestStatus.SUCCESSFUL) {
            Log.d(TAG, "Amazon user marketplace: " + response.getUserData().getMarketplace());
        } else {
            Log.w(TAG, "Amazon getUserData failed or not supported.");
        }
    }

    @Override
    public void onProductDataResponse(ProductDataResponse response) {
        if (response == null) return;
        if (response.getRequestStatus() == ProductDataResponse.RequestStatus.SUCCESSFUL) {
            Map<String, Product> productData = response.getProductData();
            if (productData != null && productData.containsKey(SKU_PRO)) {
                Product p = productData.get(SKU_PRO);
                if (p != null) {
                    localizedPrice = p.getPrice() != null ? p.getPrice() : "";
                    productTitle = p.getTitle() != null ? p.getTitle() : "LolyLine Pro";
                    productDescription = p.getDescription() != null ? p.getDescription() : "";
                    Log.d(TAG, "Loaded Amazon SKU " + SKU_PRO + " price=" + localizedPrice);

                    JSObject event = new JSObject();
                    event.put("sku", SKU_PRO);
                    event.put("price", localizedPrice);
                    event.put("title", productTitle);
                    notifyListeners("productUpdated", event);
                }
            }
        } else {
            Log.w(TAG, "Amazon onProductDataResponse status: " + response.getRequestStatus());
        }
    }

    @Override
    public void onPurchaseResponse(PurchaseResponse response) {
        if (response == null) {
            resolvePendingPurchaseError("Null response from Amazon Appstore");
            return;
        }

        PurchaseResponse.RequestStatus status = response.getRequestStatus();
        Log.d(TAG, "Amazon onPurchaseResponse status: " + status);

        switch (status) {
            case SUCCESSFUL:
                Receipt receipt = response.getReceipt();
                if (receipt != null && SKU_PRO.equals(receipt.getSku()) && !receipt.isCanceled()) {
                    PurchasingService.notifyFulfillment(receipt.getReceiptId(), FulfillmentResult.FULFILLED);
                    isProUnlocked = true;
                    resolvePendingPurchaseSuccess("SUCCESSFUL");
                } else {
                    resolvePendingPurchaseError("Invalid or canceled receipt");
                }
                break;

            case ALREADY_PURCHASED:
                isProUnlocked = true;
                resolvePendingPurchaseSuccess("ALREADY_PURCHASED");
                break;

            case INVALID_SKU:
                resolvePendingPurchaseError("Invalid SKU: " + SKU_PRO);
                break;

            case FAILED:
            case NOT_SUPPORTED:
            default:
                resolvePendingPurchaseError("Purchase failed or cancelled (" + status.name() + ")");
                break;
        }
    }

    @Override
    public void onPurchaseUpdatesResponse(PurchaseUpdatesResponse response) {
        if (response == null) {
            accumFoundPro = false;
            if (pendingRestoreCall != null) {
                pendingRestoreCall.reject("Empty response from Amazon Appstore");
                pendingRestoreCall = null;
            }
            return;
        }

        if (response.getRequestStatus() == PurchaseUpdatesResponse.RequestStatus.SUCCESSFUL) {
            for (Receipt receipt : response.getReceipts()) {
                if (SKU_PRO.equals(receipt.getSku()) && !receipt.isCanceled()) {
                    PurchasingService.notifyFulfillment(receipt.getReceiptId(), FulfillmentResult.FULFILLED);
                    accumFoundPro = true;
                }
            }

            if (response.hasMore()) {
                PurchasingService.getPurchaseUpdates(false);
                return;
            }

            isProUnlocked = accumFoundPro;
            hasSyncedFromStore = true;
            accumFoundPro = false;

            JSObject event = new JSObject();
            event.put("isPro", isProUnlocked);
            event.put("syncedFromStore", true);
            notifyListeners("entitlementUpdated", event);

            if (pendingRestoreCall != null) {
                JSObject ret = new JSObject();
                ret.put("isPro", isProUnlocked);
                ret.put("restored", isProUnlocked);
                ret.put("syncedFromStore", true);
                pendingRestoreCall.resolve(ret);
                pendingRestoreCall = null;
            }
        } else {
            accumFoundPro = false;
            Log.w(TAG, "Amazon onPurchaseUpdatesResponse status: " + response.getRequestStatus());
            if (pendingRestoreCall != null) {
                pendingRestoreCall.reject("Restore failed: " + response.getRequestStatus().name());
                pendingRestoreCall = null;
            }
        }
    }

    private void resolvePendingPurchaseSuccess(String status) {
        hasSyncedFromStore = true;
        JSObject event = new JSObject();
        event.put("isPro", true);
        event.put("syncedFromStore", true);
        notifyListeners("entitlementUpdated", event);

        if (pendingPurchaseCall != null) {
            JSObject ret = new JSObject();
            ret.put("isPro", true);
            ret.put("status", status);
            ret.put("syncedFromStore", true);
            pendingPurchaseCall.resolve(ret);
            pendingPurchaseCall = null;
        }
    }

    private void resolvePendingPurchaseError(String message) {
        if (pendingPurchaseCall != null) {
            pendingPurchaseCall.reject(message);
            pendingPurchaseCall = null;
        }
    }
}
