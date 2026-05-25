package com.example;

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.widget.TextView;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        TextView textView = new TextView(this);
        textView.setText("Riya Cosmetics Price Catalog Server is running at http://localhost:3000.\nOpen the Web Preview to see the rich lookbook layout!");
        textView.setGravity(Gravity.CENTER);
        textView.setTextSize(18);
        textView.setPadding(40, 40, 40, 40);
        
        setContentView(textView);
    }
}
