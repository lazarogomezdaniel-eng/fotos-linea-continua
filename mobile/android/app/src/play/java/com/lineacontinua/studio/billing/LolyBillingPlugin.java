package com.lineacontinua.studio.billing;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "LolyBilling")
public class LolyBillingPlugin extends Plugin {

    public static final String SKU_PRO = "lolyline_pro";

    @PluginMethod
    public void initialize(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("store", "play");
        ret.put("syncedFromStore", false);
        ret.put("isPro", false);
        ret.put("price", "");
        call.resolve(ret);
    }

    @PluginMethod
    public void getProductInfo(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("sku", SKU_PRO);
        ret.put("price", "");
        ret.put("title", "LolyLine Pro");
        ret.put("description", "");
        ret.put("isPro", false);
        call.resolve(ret);
    }

    @PluginMethod
    public void purchasePro(PluginCall call) {
        call.reject("Google Play Billing pending Phase 3 implementation.");
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("isPro", false);
        ret.put("restored", false);
        call.resolve(ret);
    }
}
