package com.lineacontinua.studio.export;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(
    name = "LolyExport",
    permissions = {
        @Permission(
            strings = { Manifest.permission.WRITE_EXTERNAL_STORAGE },
            alias = "publicStorage"
        )
    }
)
public class LolyExportPlugin extends Plugin {

    private static final String TAG = "LolyExport";

    @PluginMethod
    public void saveMedia(PluginCall call) {
        String rawFileName = call.getString("fileName");
        String base64Data = call.getString("base64Data");
        String textData = call.getString("textData");
        String mimeType = call.getString("mimeType", "application/octet-stream");

        if (rawFileName == null || rawFileName.trim().isEmpty()) {
            call.reject("Missing fileName");
            return;
        }
        String fileName = rawFileName.replaceAll("[\\\\/:*?\"<>|]", "_");

        byte[] bytes;
        try {
            if (textData != null) {
                bytes = textData.getBytes(StandardCharsets.UTF_8);
            } else if (base64Data != null) {
                int commaIdx = base64Data.indexOf(',');
                String cleanBase64 = commaIdx >= 0 ? base64Data.substring(commaIdx + 1) : base64Data;
                bytes = Base64.decode(cleanBase64, Base64.DEFAULT);
            } else {
                call.reject("Missing file data");
                return;
            }
        } catch (IllegalArgumentException | OutOfMemoryError e) {
            Log.e(TAG, "Failed to decode export payload", e);
            call.reject("Invalid export payload: " + e.getMessage());
            return;
        }

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q && getPermissionState("publicStorage") != PermissionState.GRANTED) {
            requestPermissionForAlias("publicStorage", call, "handleStoragePermission");
            return;
        }

        writeBytesToPublicFolder(call, fileName, mimeType, bytes);
    }

    @PermissionCallback
    private void handleStoragePermission(PluginCall call) {
        if (getPermissionState("publicStorage") == PermissionState.GRANTED) {
            saveMedia(call);
        } else {
            call.reject("STORAGE_PERMISSION_DENIED");
        }
    }

    private void writeBytesToPublicFolder(PluginCall call, String fileName, String mimeType, byte[] bytes) {
        String lowerMime = mimeType != null ? mimeType.toLowerCase() : "";
        String lowerName = fileName.toLowerCase();
        boolean isSvg = lowerMime.contains("svg") || lowerName.endsWith(".svg");
        boolean isRasterImage = !isSvg && (lowerMime.startsWith("image/") || lowerName.endsWith(".png") || lowerName.endsWith(".jpg") || lowerName.endsWith(".webp"));
        boolean isVideo = lowerMime.startsWith("video/") || lowerName.endsWith(".webm") || lowerName.endsWith(".mp4");

        String baseDirType;
        String folderLabel;
        if (isRasterImage) {
            baseDirType = Environment.DIRECTORY_PICTURES;
            folderLabel = "Pictures/LolyLine";
        } else if (isVideo) {
            baseDirType = Environment.DIRECTORY_MOVIES;
            folderLabel = "Movies/LolyLine";
        } else {
            baseDirType = Environment.DIRECTORY_DOWNLOADS;
            folderLabel = "Downloads/LolyLine";
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            Uri collection;
            String effectiveMime = mimeType;
            if (isRasterImage) {
                collection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
            } else if (isVideo) {
                collection = MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
            } else {
                collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                if (effectiveMime == null || effectiveMime.isEmpty()) {
                    effectiveMime = isSvg ? "image/svg+xml" : "application/octet-stream";
                }
            }

            ContentResolver resolver = getContext().getContentResolver();
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
            values.put(MediaStore.MediaColumns.MIME_TYPE, effectiveMime);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, baseDirType + File.separator + "LolyLine");
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);

            Uri itemUri = null;
            try {
                itemUri = resolver.insert(collection, values);
                if (itemUri == null) {
                    call.reject("MEDIASTORE_INSERT_FAILED");
                    return;
                }
                try (OutputStream out = resolver.openOutputStream(itemUri)) {
                    if (out == null) {
                        throw new IOException("openOutputStream returned null");
                    }
                    out.write(bytes);
                    out.flush();
                }

                ContentValues done = new ContentValues();
                done.put(MediaStore.MediaColumns.IS_PENDING, 0);
                resolver.update(itemUri, done, null, null);

                JSObject ret = new JSObject();
                ret.put("saved", true);
                ret.put("uri", itemUri.toString());
                ret.put("fileName", fileName);
                ret.put("folder", folderLabel);
                ret.put("location", folderLabel + "/" + fileName);
                call.resolve(ret);
            } catch (Exception e) {
                Log.e(TAG, "MediaStore write failed for " + fileName, e);
                if (itemUri != null) {
                    try {
                        resolver.delete(itemUri, null, null);
                    } catch (Exception ignored) {}
                }
                call.reject("MEDIASTORE_WRITE_FAILED: " + e.getMessage());
            }
            return;
        }

        // Legacy Android 7-9 (API 24-28)
        @SuppressWarnings("deprecation")
        File pubDir = new File(Environment.getExternalStoragePublicDirectory(baseDirType), "LolyLine");
        if (!pubDir.exists() && !pubDir.mkdirs()) {
            call.reject("LEGACY_MKDIR_FAILED");
            return;
        }
        File outFile = new File(pubDir, fileName);
        try (FileOutputStream fos = new FileOutputStream(outFile)) {
            fos.write(bytes);
            fos.flush();
            MediaScannerConnection.scanFile(
                getContext(),
                new String[]{ outFile.getAbsolutePath() },
                new String[]{ mimeType },
                null
            );
            JSObject ret = new JSObject();
            ret.put("saved", true);
            ret.put("uri", Uri.fromFile(outFile).toString());
            ret.put("fileName", fileName);
            ret.put("folder", folderLabel);
            ret.put("location", folderLabel + "/" + fileName);
            call.resolve(ret);
        } catch (Exception e) {
            Log.e(TAG, "Legacy file write failed for " + fileName, e);
            call.reject("LEGACY_WRITE_FAILED: " + e.getMessage());
        }
    }
}
