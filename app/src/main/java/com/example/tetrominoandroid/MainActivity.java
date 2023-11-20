/* Tetris-based Android web application example
 * Copyright (C) 2023  Gonzalo Exequiel Pedone
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package com.example.androidtetromino;

import android.content.Context;
import android.os.Bundle;
import android.os.StrictMode;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebSettings;
import androidx.appcompat.app.AppCompatActivity;

import com.example.androidtetromino.databinding.ActivityMainBinding;

public class MainActivity extends AppCompatActivity
{
    private ActivityMainBinding binding;

    // Used to load the 'androidtetromino' library on application startup.
    static {
        System.loadLibrary("androidtetromino");
    }

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);

        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        StrictMode.VmPolicy.Builder builder = new StrictMode.VmPolicy.Builder();
        StrictMode.setVmPolicy(builder.build());

        // Enable JavaScript
        WebView myWebView = (WebView) findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        myWebView.addJavascriptInterface(new JsObject(), "Android");

        myWebView.loadUrl("file:///android_asset/index.html");
    }

     class JsObject
     {
        @JavascriptInterface
        public String hellowText()
        {
            return stringFromJNI();
        }
    }

    /**
     * A native method that is implemented by the 'androidtetromino' native library,
     * which is packaged with this application.
     */
    public native String stringFromJNI();
}
