package com.example.takiplay.ui.screens.mesa.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.ui.components.LanguageBadge
import com.example.takiplay.ui.screens.mesa.LyricsEntry
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun LyricsBottomPanel(entries: List<LyricsEntry>, t: Strings) {
    if (entries.isEmpty()) return

    var expanded by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface, RoundedCornerShape(16.dp))
            .border(width = 1.dp, color = DarkBorder, shape = RoundedCornerShape(16.dp))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Mic, contentDescription = null, tint = IncaGold, modifier = Modifier.size(16.dp))
                Text(
                    text = "${t.lyrics} (${entries.size})",
                    color = WarmWhite,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                )
            }
            Icon(
                imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                contentDescription = null,
                tint = SoilBrown,
                modifier = Modifier.size(20.dp)
            )
        }

        AnimatedVisibility(visible = expanded) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 384.dp)
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(entries, key = { it.queueItemId }) { entry ->
                    LyricsEntryCard(entry = entry, t = t)
                }
            }
        }
    }
}

@Composable
private fun LyricsEntryCard(entry: LyricsEntry, t: Strings) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkBase.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
            .border(1.dp, DarkBorder, RoundedCornerShape(10.dp)),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = entry.song.title,
                    color = WarmWhite,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = entry.song.artist,
                    color = SandBeige,
                    fontSize = 11.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
            if (entry.status == "PLAYING") {
                LanguageBadge(language = "PLAYING")
            }
        }

        Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
            if (entry.song.lyrics != null) {
                Text(
                    text = entry.song.lyrics,
                    color = WarmWhite,
                    fontSize = 13.sp,
                    lineHeight = 18.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 220.dp)
                        .verticalScroll(rememberScrollState()),
                )
            } else {
                Text(
                    text = t.lyricsPanelNoLyrics,
                    color = SoilBrown,
                    fontSize = 12.sp,
                )
            }
        }
    }
}
