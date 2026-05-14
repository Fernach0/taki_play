package com.example.takiplay.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.ui.theme.*

@Composable
fun LanguageBadge(language: String, modifier: Modifier = Modifier) {
    val (bg, text, label) = when (language) {
        "SPANISH" -> Triple(ChakraOcre.copy(alpha = 0.2f), ChakraOcre, "ES")
        "KICHWA"  -> Triple(KichwaRojo.copy(alpha = 0.2f), KichwaRojo,  "KI")
        "ACHUAR"  -> Triple(SelvaVerde.copy(alpha = 0.2f), SelvaVerde,  "SH")
        "OTHER"   -> Triple(GrisParamo.copy(alpha = 0.2f), GrisParamo,  "+")
        "PLAYING" -> Triple(IncaGold.copy(alpha = 0.2f),   IncaGold,   "▶")
        else      -> Triple(GrisParamo.copy(alpha = 0.2f), GrisParamo, language.take(2))
    }
    Text(
        text  = label,
        color = text,
        fontSize   = 10.sp,
        fontWeight = FontWeight.Bold,
        modifier   = modifier
            .background(bg, RoundedCornerShape(4.dp))
            .border(1.dp, text.copy(alpha = 0.4f), RoundedCornerShape(4.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    )
}

@Composable
fun StatusBadge(isActive: Boolean, activeLabel: String, inactiveLabel: String) {
    val (bg, fg) = if (isActive)
        Pair(VerdeKitu.copy(alpha = 0.15f), VerdeKitu)
    else
        Pair(DarkBorder, SoilBrown)
    Text(
        text  = if (isActive) activeLabel else inactiveLabel,
        color = fg,
        fontSize = 10.sp,
        fontWeight = FontWeight.Medium,
        modifier = Modifier
            .background(bg, RoundedCornerShape(20.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    )
}
