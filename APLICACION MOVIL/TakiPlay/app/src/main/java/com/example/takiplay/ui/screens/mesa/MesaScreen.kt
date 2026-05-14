package com.example.takiplay.ui.screens.mesa

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.takiplay.data.model.Song
import com.example.takiplay.ui.components.LanguageSelector
import com.example.takiplay.ui.screens.mesa.components.*
import com.example.takiplay.ui.theme.*
import com.example.takiplay.util.PreferencesManager
import com.example.takiplay.util.Translations
import kotlinx.coroutines.launch

@Composable
fun MesaScreen(
    qrCode: String,
    lang: String,
    prefs: PreferencesManager,
    onBack: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    val t = Translations.get(lang)

    val vm: MesaViewModel = viewModel(
        key = qrCode,
        factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T =
                MesaViewModel(qrCode, prefs) as T
        }
    )
    val state by vm.state.collectAsState()

    var selectedSong by remember { mutableStateOf<Song?>(null) }
    var sheetOpen by remember { mutableStateOf(false) }

    // Show toast-like snackbar
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(state.requestSuccess) {
        state.requestSuccess?.let {
            snackbarHostState.showSnackbar(it)
            vm.clearRequestFeedback()
        }
    }
    LaunchedEffect(state.requestError) {
        state.requestError?.let {
            snackbarHostState.showSnackbar(it)
            vm.clearRequestFeedback()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = DarkBase,
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            Column(modifier = Modifier.fillMaxSize()) {

                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(DarkBase.copy(alpha = 0.95f))
                        .padding(horizontal = 8.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = null, tint = WarmWhite)
                        }
                        Column {
                            Text("Taki Play", color = WarmWhite, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                            if (state.tableNumber != null) {
                                Text("Mesa #${state.tableNumber}", color = IncaGold, fontSize = 11.sp)
                            }
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        LanguageSelector(
                            currentLang = lang,
                            onSelect = { scope.launch { prefs.setLanguage(it) } },
                        )
                        Text(
                            text  = "${state.pendingCount}/10",
                            color = SoilBrown,
                            fontSize = 11.sp,
                        )
                    }
                }

                // Search bar
                Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp)) {
                    OutlinedTextField(
                        value = state.search,
                        onValueChange = { vm.setSearch(it) },
                        placeholder = { Text(t.search, color = SoilBrown, fontSize = 13.sp) },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SoilBrown, modifier = Modifier.size(18.dp)) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor   = IncaGold,
                            unfocusedBorderColor = DarkBorder,
                            focusedTextColor     = WarmWhite,
                            unfocusedTextColor   = WarmWhite,
                            cursorColor          = IncaGold,
                        ),
                        shape = RoundedCornerShape(12.dp),
                    )
                }

                // Filters
                Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp)) {
                    SongFilters(selected = state.langFilter, onChange = { vm.setLangFilter(it) }, t = t)
                }

                // Song grid
                Box(modifier = Modifier.weight(1f)) {
                    when {
                        state.loadingSongs -> {
                            CircularProgressIndicator(
                                color = IncaGold,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                        state.songs.isEmpty() -> {
                            Text(
                                text = t.noSongs,
                                color = SoilBrown,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }
                        else -> {
                            LazyVerticalGrid(
                                columns = GridCells.Fixed(2),
                                contentPadding = PaddingValues(12.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalArrangement   = Arrangement.spacedBy(10.dp),
                                modifier = Modifier.fillMaxSize(),
                            ) {
                                items(state.songs, key = { it.id }) { song ->
                                    SongCard(song = song, onClick = {
                                        selectedSong = it
                                        sheetOpen = true
                                    })
                                }
                            }
                        }
                    }
                }

                // Queue bottom panel
                QueueBottomPanel(
                    items        = state.queueItems,
                    pendingCount = state.pendingCount,
                    t            = t,
                )
            }

            // Joining error banner
            if (state.joiningError != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter)
                        .padding(16.dp)
                        .background(KichwaRojo.copy(alpha = 0.15f), RoundedCornerShape(10.dp))
                        .border(1.dp, KichwaRojo.copy(alpha = 0.4f), RoundedCornerShape(10.dp))
                        .padding(12.dp)
                ) {
                    Text(state.joiningError!!, color = KichwaRojo, fontSize = 13.sp)
                }
            }
        }
    }

    // Song detail bottom sheet
    SongDetailSheet(
        song           = selectedSong,
        isOpen         = sheetOpen,
        pendingCount   = state.pendingCount,
        isSessionReady = state.sessionReady,
        isRequesting   = state.isRequesting,
        t              = t,
        onRequest      = { song ->
            vm.requestSong(song)
            sheetOpen = false
        },
        onClose = {
            sheetOpen = false
            selectedSong = null
        },
    )
}
