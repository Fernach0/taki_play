package com.example.takiplay.ui.screens.mesa.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.data.model.QueueItem
import com.example.takiplay.data.model.QueueStatus
import com.example.takiplay.ui.components.LanguageBadge
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun QueueBottomPanel(items: List<QueueItem>, pendingCount: Int, t: Strings) {
    if (items.isEmpty()) return

    var expanded by remember { mutableStateOf(false) }
    val playing = items.find { it.status == QueueStatus.PLAYING }
    val pending = items.filter { it.status == QueueStatus.PENDING }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface.copy(alpha = 0.97f))
            .border(width = 1.dp, color = IncaGold.copy(alpha = 0.2f),
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp))
    ) {
        // Handle row
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.MusicNote, contentDescription = null, tint = IncaGold, modifier = Modifier.size(16.dp))
                Text(
                    text = "${t.queueLabel} ($pendingCount)",
                    color = WarmWhite,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                )
                if (playing != null) {
                    LanguageBadge(language = "PLAYING")
                }
            }
            Icon(
                imageVector = if (expanded) Icons.Default.KeyboardArrowDown else Icons.Default.KeyboardArrowUp,
                contentDescription = null,
                tint = SoilBrown,
                modifier = Modifier.size(20.dp)
            )
        }

        AnimatedVisibility(visible = expanded) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 260.dp)
                    .padding(horizontal = 12.dp)
                    .padding(bottom = 12.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp),
            ) {
                if (playing != null) {
                    item {
                        QueueItemRow(item = playing, index = null, t = t, isPlaying = true)
                    }
                }
                items(pending.take(10)) { item ->
                    val idx = pending.indexOf(item) + 1
                    QueueItemRow(item = item, index = idx, t = t, isPlaying = false)
                }
            }
        }
    }
}

@Composable
private fun QueueItemRow(item: QueueItem, index: Int?, t: Strings, isPlaying: Boolean) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                if (isPlaying) IncaGold.copy(alpha = 0.1f) else DarkBase.copy(alpha = 0.5f),
                RoundedCornerShape(8.dp)
            )
            .border(
                1.dp,
                if (isPlaying) IncaGold.copy(alpha = 0.3f) else DarkBorder,
                RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 10.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        if (isPlaying) {
            Icon(Icons.Default.MusicNote, contentDescription = null, tint = IncaGold, modifier = Modifier.size(14.dp))
        } else {
            Text(
                text  = "$index",
                color = SoilBrown,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.width(16.dp)
            )
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text     = item.song.title,
                color    = WarmWhite,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(text = item.song.artist, color = SoilBrown, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        if (item.requestedBy != null) {
            Text(text = "${t.by} ${item.requestedBy}", color = SoilBrown.copy(alpha = 0.7f), fontSize = 10.sp)
        }
    }
}
