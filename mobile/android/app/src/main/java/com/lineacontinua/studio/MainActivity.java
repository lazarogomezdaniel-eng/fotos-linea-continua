package com.lineacontinua.studio;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.lineacontinua.studio.billing.LolyBillingPlugin;
import com.lineacontinua.studio.export.LolyExportPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LolyBillingPlugin.class);
        registerPlugin(LolyExportPlugin.class);
        super.onCreate(savedInstanceState);

        // API 35/36 (Android 15/16 & Fire OS 16) enforces edge-to-edge without opt-out.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
            Window window = getWindow();
            View content = findViewById(android.R.id.content);
            if (window != null) {
                WindowInsetsControllerCompat controller =
                    WindowCompat.getInsetsController(window, window.getDecorView());
                controller.setAppearanceLightStatusBars(false);
                controller.setAppearanceLightNavigationBars(false);
            }
            if (content != null) {
                content.setBackgroundColor(Color.parseColor("#07090e"));
                ViewCompat.setOnApplyWindowInsetsListener(content, (v, windowInsets) -> {
                    Insets sys = windowInsets.getInsets(
                        WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                    );
                    Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
                    v.setPadding(sys.left, sys.top, sys.right, Math.max(sys.bottom, ime.bottom));
                    return WindowInsetsCompat.CONSUMED;
                });
            }
        }
    }
}
