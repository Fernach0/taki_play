package com.example.takiplay.util

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import com.example.takiplay.data.api.ApiClient
import com.example.takiplay.data.model.Admin
import com.example.takiplay.data.model.SessionData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "takiplay_prefs")

class PreferencesManager(private val context: Context) {

    companion object {
        // Auth
        private val KEY_TOKEN        = stringPreferencesKey("jwt_token")
        private val KEY_ADMIN_ID     = stringPreferencesKey("admin_id")
        private val KEY_ADMIN_NAME   = stringPreferencesKey("admin_name")
        private val KEY_ADMIN_EMAIL  = stringPreferencesKey("admin_email")
        // Session
        private val KEY_SESSION_ID     = stringPreferencesKey("session_id")
        private val KEY_TABLE_ID       = stringPreferencesKey("table_id")
        private val KEY_TABLE_NUMBER   = intPreferencesKey("table_number")
        // Language
        private val KEY_LANGUAGE = stringPreferencesKey("ui_language")
    }

    // ── Auth ─────────────────────────────────────────────
    val token: Flow<String?> = context.dataStore.data.map { it[KEY_TOKEN] }
    val isAuthenticated: Flow<Boolean> = token.map { it != null }
    val adminName: Flow<String?> = context.dataStore.data.map { it[KEY_ADMIN_NAME] }

    suspend fun saveAuth(token: String, admin: Admin) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN]       = token
            prefs[KEY_ADMIN_ID]    = admin.id
            prefs[KEY_ADMIN_NAME]  = admin.name
            prefs[KEY_ADMIN_EMAIL] = admin.email
        }
        ApiClient.setToken(token)
    }

    suspend fun clearAuth() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_TOKEN)
            prefs.remove(KEY_ADMIN_ID)
            prefs.remove(KEY_ADMIN_NAME)
            prefs.remove(KEY_ADMIN_EMAIL)
        }
        ApiClient.setToken(null)
    }

    suspend fun loadTokenToClient() {
        val t = context.dataStore.data.first()[KEY_TOKEN]
        ApiClient.setToken(t)
    }

    // ── Session (mesa/table) ──────────────────────────────
    val sessionId: Flow<String?> = context.dataStore.data.map { it[KEY_SESSION_ID] }
    val tableId: Flow<String?> = context.dataStore.data.map { it[KEY_TABLE_ID] }
    val tableNumber: Flow<Int?> = context.dataStore.data.map { it[KEY_TABLE_NUMBER] }

    suspend fun saveSession(session: SessionData) {
        context.dataStore.edit { prefs ->
            prefs[KEY_SESSION_ID]   = session.sessionId
            prefs[KEY_TABLE_ID]     = session.tableId
            prefs[KEY_TABLE_NUMBER] = session.tableNumber
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_SESSION_ID)
            prefs.remove(KEY_TABLE_ID)
            prefs.remove(KEY_TABLE_NUMBER)
        }
    }

    suspend fun getSessionSnapshot(): Triple<String?, String?, Int?> {
        val prefs = context.dataStore.data.first()
        return Triple(prefs[KEY_SESSION_ID], prefs[KEY_TABLE_ID], prefs[KEY_TABLE_NUMBER])
    }

    // ── Language ─────────────────────────────────────────
    val language: Flow<String> = context.dataStore.data.map { it[KEY_LANGUAGE] ?: "es" }

    suspend fun setLanguage(lang: String) {
        context.dataStore.edit { it[KEY_LANGUAGE] = lang }
    }
}
