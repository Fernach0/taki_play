package com.example.takiplay.ui.screens.dj.login

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.*
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.takiplay.ui.components.LanguageSelector
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.PreferencesManager
import com.example.takiplay.util.Translations
import kotlinx.coroutines.launch

@Composable
fun DJLoginScreen(
    lang: String,
    prefs: PreferencesManager,
    onLoginSuccess: () -> Unit,
    onBack: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val t = Translations.get(lang)

    val vm: DJLoginViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                DJLoginViewModel(prefs) as T
        }
    )
    val state by vm.state.collectAsState()

    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    LaunchedEffect(state.success) {
        if (state.success) onLoginSuccess()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBase)
    ) {
        // Glow accents
        Box(
            modifier = Modifier
                .size(400.dp)
                .offset(x = (-100).dp, y = (-100).dp)
                .background(
                    androidx.compose.ui.graphics.Brush.radialGradient(
                        colors = listOf(IncaGold.copy(alpha = 0.05f), androidx.compose.ui.graphics.Color.Transparent)
                    )
                )
        )

        // Language selector
        LanguageSelector(
            currentLang = lang,
            onSelect = { scope.launch { prefs.setLanguage(it) } },
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp),
        )

        // Back button
        IconButton(
            onClick = onBack,
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(8.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = WarmWhite)
        }

        // Main content
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.Center)
                .padding(horizontal = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            // Logo
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .background(IncaGold.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                        .border(1.dp, IncaGold.copy(alpha = 0.4f), RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Default.MusicNote, contentDescription = null, tint = IncaGold, modifier = Modifier.size(32.dp))
                }
                Spacer(Modifier.height(12.dp))
                Text("Taki Play", color = WarmWhite, fontSize = 28.sp, fontWeight = FontWeight.Bold)
                Text(t.djSubtitle, color = SandBeige, fontSize = 13.sp)
            }

            // Login card
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DarkSurface, RoundedCornerShape(16.dp))
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Text(t.djLoginTitle, color = WarmWhite, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)

                // Email
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it; vm.clearError() },
                    label = { Text(t.djEmail, fontSize = 12.sp) },
                    placeholder = { Text("dj@takiplay.com", color = SoilBrown, fontSize = 13.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                    colors = textFieldColors(),
                    shape = RoundedCornerShape(10.dp),
                )

                // Password
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it; vm.clearError() },
                    label = { Text(t.djPassword, fontSize = 12.sp) },
                    placeholder = { Text("••••••••", color = SoilBrown, fontSize = 13.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = null,
                                tint = SoilBrown
                            )
                        }
                    },
                    colors = textFieldColors(),
                    shape = RoundedCornerShape(10.dp),
                )

                // Error message
                if (state.error != null) {
                    Text(
                        text = state.error!!,
                        color = RojoSangay,
                        fontSize = 12.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(RojoSangay.copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                            .padding(10.dp)
                    )
                }

                // Login button
                Button(
                    onClick = { vm.login(email, password) },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    enabled = !state.isLoading,
                    colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                    shape = RoundedCornerShape(10.dp),
                ) {
                    if (state.isLoading) {
                        CircularProgressIndicator(color = DarkBase, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    } else {
                        Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(8.dp))
                        Text(t.djLoginBtn, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun textFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor    = IncaGold,
    unfocusedBorderColor  = DarkBorder,
    focusedTextColor      = WarmWhite,
    unfocusedTextColor    = WarmWhite,
    focusedLabelColor     = IncaGold,
    unfocusedLabelColor   = SoilBrown,
    cursorColor           = IncaGold,
    focusedContainerColor = DarkBase,
    unfocusedContainerColor = DarkBase,
)
