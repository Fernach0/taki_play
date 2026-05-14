package com.example.takiplay.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.ui.theme.*

private data class LangOption(val id: String, val icon: String, val label: String)

private val LANGS = listOf(
    LangOption("es", "🇪🇸", "ES"),
    LangOption("ki", "🪶",  "KI"),
    LangOption("sh", "🌿",  "SH"),
)

@Composable
fun LanguageSelector(
    currentLang: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .background(DarkSurface, RoundedCornerShape(12.dp))
            .border(1.dp, DarkBorder, RoundedCornerShape(12.dp))
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(2.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        LANGS.forEach { l ->
            val selected = currentLang == l.id
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (selected) IncaGold else androidx.compose.ui.graphics.Color.Transparent)
                    .clickable { onSelect(l.id) }
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(text = l.icon, fontSize = 12.sp)
                Text(
                    text  = l.label,
                    color = if (selected) DarkBase else SoilBrown,
                    fontSize   = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
    }
}
