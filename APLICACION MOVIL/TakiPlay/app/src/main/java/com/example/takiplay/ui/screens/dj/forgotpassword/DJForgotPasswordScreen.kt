package com.example.takiplay.ui.screens.dj.forgotpassword

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.Strings

@Composable
fun DJForgotPasswordScreen(
    t: Strings,
    onBack: () -> Unit,
) {
    val vm: DJForgotPasswordViewModel = viewModel(
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                DJForgotPasswordViewModel() as T
        }
    )
    val state by vm.state.collectAsState()
    var email by remember { mutableStateOf("") }

    Box(modifier = Modifier.fillMaxSize().background(DarkBase)) {
        IconButton(
            onClick = onBack,
            modifier = Modifier.align(Alignment.TopStart).padding(8.dp)
        ) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = WarmWhite)
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.Center)
                .padding(horizontal = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
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
                Text(t.forgotPasswordTitle, color = WarmWhite, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(DarkSurface, RoundedCornerShape(16.dp))
                    .border(1.dp, DarkBorder, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                if (state.sent) {
                    Text(t.forgotPasswordSuccess, color = SandBeige, fontSize = 13.sp)
                    TextButton(onClick = onBack) {
                        Text(t.forgotPasswordBackToLogin, color = IncaGold, fontSize = 13.sp)
                    }
                } else {
                    Text(t.forgotPasswordDesc, color = SandBeige, fontSize = 13.sp)

                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it; vm.clearError() },
                        label = { Text(t.djEmail, fontSize = 12.sp) },
                        placeholder = { Text("dj@takiplay.com", color = SoilBrown, fontSize = 13.sp) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Done),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor    = IncaGold,
                            unfocusedBorderColor  = DarkBorder,
                            focusedTextColor      = WarmWhite,
                            unfocusedTextColor    = WarmWhite,
                            focusedLabelColor     = IncaGold,
                            unfocusedLabelColor   = SoilBrown,
                            cursorColor           = IncaGold,
                            focusedContainerColor = DarkBase,
                            unfocusedContainerColor = DarkBase,
                        ),
                        shape = RoundedCornerShape(10.dp),
                    )

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

                    Button(
                        onClick = { vm.submit(email) },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        enabled = !state.isLoading,
                        colors = ButtonDefaults.buttonColors(containerColor = IncaGold, contentColor = DarkBase),
                        shape = RoundedCornerShape(10.dp),
                    ) {
                        if (state.isLoading) {
                            CircularProgressIndicator(color = DarkBase, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(8.dp))
                            Text(t.forgotPasswordSendBtn, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        }
                    }
                }
            }
        }
    }
}
