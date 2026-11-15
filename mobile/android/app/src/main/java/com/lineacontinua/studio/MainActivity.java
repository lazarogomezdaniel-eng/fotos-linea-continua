package com.lineacontinua.studio;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.lineacontinua.studio.billing.LolyBillingPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(LolyBillingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
