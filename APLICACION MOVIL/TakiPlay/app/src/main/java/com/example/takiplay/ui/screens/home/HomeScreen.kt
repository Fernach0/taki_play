package com.example.takiplay.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.TableRestaurant
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.takiplay.ui.components.LanguageSelector
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.PreferencesManager
import com.example.takiplay.util.Translations
import kotlinx.coroutines.launch

@Composable
fun HomeScreen(
    lang: String,
    onSetLang: (String) -> Unit,
    onSelectTable: () -> Unit,
    prefs: PreferencesManager,
) {
    val scope = rememberCoroutineScope()
    val t = Translations.get(lang)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBase)
    ) {
        // Glow de fondo
        Box(
            modifier = Modifier
                .size(600.dp)
                .offset(x = (-100).dp, y = (-100).dp)
                .background(
                    Brush.radialGradient(
                        colors = listOf(IncaGold.copy(alpha = 0.04f), androidx.compose.ui.graphics.Color.Transparent)
                    )
                )
        )

        // Selector de idioma — esquina superior derecha
        LanguageSelector(
            currentLang = lang,
            onSelect = { scope.launch { prefs.setLanguage(it) } },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp),
        )

        // Contenido principal
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.Center)
                .padding(horizontal = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(32.dp),
        ) {
            // Logo + título
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(IncaGold.copy(alpha = 0.15f), RoundedCornerShape(20.dp))
                        .border(1.dp, IncaGold.copy(alpha = 0.4f), RoundedCornerShape(20.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Default.MusicNote,
                        contentDescription = null,
                        tint = IncaGold,
                        modifier = Modifier.size(40.dp),
                    )
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text       = "Taki Play",
                        color      = WarmWhite,
                        fontSize   = 36.sp,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text          = t.homeSubtitle,
                        color         = IncaGold,
                        fontSize      = 13.sp,
                        letterSpacing = 2.sp,
                    )
                    Text(
                        text      = t.homeLangs,
                        color     = SoilBrown,
                        fontSize  = 11.sp,
                        fontStyle = FontStyle.Italic,
                    )
                }
            }

            // Tarjeta de selección de mesa
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DarkSurface, RoundedCornerShape(16.dp))
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .background(IncaGold.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                        .border(2.dp, IncaGold.copy(alpha = 0.5f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Default.TableRestaurant,
                        contentDescription = null,
                        tint = IncaGold,
                        modifier = Modifier.size(32.dp),
                    )
                }

                Text(
                    text       = "Elige tu mesa",
                    color      = WarmWhite,
                    fontSize   = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    textAlign  = TextAlign.Center,
                )
                Text(
                    text       = "Selecciona la mesa en la que estás sentado para empezar a pedir canciones.",
                    color      = SandBeige,
                    fontSize   = 13.sp,
                    textAlign  = TextAlign.Center,
                    lineHeight = 20.sp,
                )

                // Botón principal
                Button(
                    onClick  = onSelectTable,
                    modifier = Modifier.fillMaxWidth(),
                    colors   = ButtonDefaults.buttonColors(
                        containerColor = IncaGold,
                        contentColor   = DarkBase,
                    ),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Icon(
                        Icons.Default.TableRestaurant,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text       = "Ver mesas disponibles",
                        fontWeight = FontWeight.Bold,
                        fontSize   = 14.sp,
                    )
                }

                HorizontalDivider(color = DarkBorder, thickness = 1.dp)
                Text(
                    text      = t.homeFooter,
                    color     = SoilBrown,
                    fontSize  = 11.sp,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}
