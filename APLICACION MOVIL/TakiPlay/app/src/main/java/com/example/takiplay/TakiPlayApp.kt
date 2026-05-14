package com.example.takiplay

import android.app.Application
import com.example.takiplay.util.PreferencesManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class TakiPlayApp : Application() {

    lateinit var prefs: PreferencesManager
        private set

    override fun onCreate() {
        super.onCreate()
        prefs = PreferencesManager(applicationContext)
        // Restore JWT token to the API client on startup
        CoroutineScope(Dispatchers.IO).launch {
            prefs.loadTokenToClient()
        }
    }
}
