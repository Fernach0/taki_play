package com.example.takiplay.ui.screens.mesa.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.data.model.Language
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

private data class FilterOption(
    val value: String,
    val label: String,
    val activeBg: androidx.compose.ui.graphics.Color,
    val activeText: androidx.compose.ui.graphics.Color,
)

@Composable
fun SongFilters(
    selected: String,
    onChange: (String) -> Unit,
    t: Strings,
) {
    val filters = listOf(
        FilterOption(Language.ALL,     t.filterAll,     IncaGold,    DarkBase),
        FilterOption(Language.SPANISH, t.filterSpanish, ChakraOcre,  WarmWhite),
        FilterOption(Language.KICHWA,  t.filterKichwa,  KichwaRojo,  WarmWhite),
        FilterOption(Language.ACHUAR,  t.filterAchuar,  SelvaVerde,  WarmWhite),
        FilterOption(Language.OTHER,   t.filterOther,   GrisParamo,  WarmWhite),
    )

    LazyRow(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 0.dp),
    ) {
        items(filters) { f ->
            val isSelected = selected == f.value
            Text(
                text  = f.label,
                color = if (isSelected) f.activeText else SoilBrown,
                fontSize   = 13.sp,
                fontWeight = FontWeight.Medium,
                modifier   = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (isSelected) f.activeBg else androidx.compose.ui.graphics.Color.Transparent)
                    .border(1.dp, if (isSelected) f.activeBg else DarkBorder, RoundedCornerShape(20.dp))
                    .clickable { onChange(f.value) }
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            )
        }
    }
}
