package com.example.takiplay.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val TakiPlayColorScheme = darkColorScheme(
    primary          = IncaGold,
    onPrimary        = DarkBase,
    primaryContainer = DarkSurface,
    secondary        = SelvaVerde,
    onSecondary      = WarmWhite,
    tertiary         = KichwaRojo,
    onTertiary       = WarmWhite,
    background       = DarkBase,
    onBackground     = WarmWhite,
    surface          = DarkSurface,
    onSurface        = WarmWhite,
    surfaceVariant   = DarkBorder,
    onSurfaceVariant = SandBeige,
    outline          = DarkBorder,
    error            = RojoSangay,
    onError          = WarmWhite,
)

@Composable
fun TakiPlayTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = TakiPlayColorScheme,
        typography  = Typography,
        content     = content
    )
}
