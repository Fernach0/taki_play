package com.example.takiplay.ui.screens.dj.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.ui.screens.dj.dashboard.tabs.*
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.PreferencesManager
import com.example.takiplay.util.Translations
import kotlinx.coroutines.launch

private enum class DJTab { QUEUE, SONGS, TABLES, ADMINS }

@Composable
fun DJDashboardScreen(
    lang: String,
    prefs: PreferencesManager,
    onLogout: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val t = Translations.get(lang)
    var activeTab by remember { mutableStateOf(DJTab.QUEUE) }

    Column(modifier = Modifier.fillMaxSize().background(DarkBase)) {

        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkSurface)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Icon(Icons.Default.MusicNote, contentDescription = null, tint = IncaGold, modifier = Modifier.size(20.dp))
                Column {
                    Text("Taki Play", color = WarmWhite, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text(t.djPanelLabel, color = IncaGold, fontSize = 10.sp)
                }
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Language compact selector
                Row(horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                    listOf("es" to "ES", "ki" to "KI", "sh" to "SH").forEach { (id, label) ->
                        val sel = lang == id
                        TextButton(
                            onClick = { scope.launch { prefs.setLanguage(id) } },
                            contentPadding = PaddingValues(horizontal = 6.dp, vertical = 2.dp),
                            colors = ButtonDefaults.textButtonColors(
                                contentColor = if (sel) IncaGold else SoilBrown
                            )
                        ) {
                            Text(label, fontSize = 10.sp, fontWeight = if (sel) FontWeight.Bold else FontWeight.Normal)
                        }
                    }
                }
                IconButton(onClick = {
                    scope.launch { prefs.clearAuth() }
                    onLogout()
                }) {
                    Icon(Icons.Default.ExitToApp, contentDescription = t.djLogout, tint = SoilBrown)
                }
            }
        }

        // Tab bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(DarkSurface.copy(alpha = 0.7f))
                .padding(horizontal = 4.dp),
        ) {
            listOf(
                DJTab.QUEUE  to Pair(Icons.Default.QueueMusic,    t.tabQueue),
                DJTab.SONGS  to Pair(Icons.Default.MusicNote,     t.tabSongs),
                DJTab.TABLES to Pair(Icons.Default.TableRestaurant, t.tabTables),
                DJTab.ADMINS to Pair(Icons.Default.People,        t.tabAdmins),
            ).forEach { (tab, pair) ->
                val (icon, label) = pair
                val selected = activeTab == tab
                TextButton(
                    onClick = { activeTab = tab },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = if (selected) IncaGold else SoilBrown
                    )
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
                        Text(label, fontSize = 9.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal)
                    }
                }
            }
        }

        // Tab indicator
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(2.dp)
                .background(DarkBorder)
        )

        // Tab content
        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            when (activeTab) {
                DJTab.QUEUE  -> QueueTab(t = t)
                DJTab.SONGS  -> SongsTab(t = t)
                DJTab.TABLES -> TablesTab(t = t)
                DJTab.ADMINS -> AdminsTab(t = t)
            }
        }
    }
}
