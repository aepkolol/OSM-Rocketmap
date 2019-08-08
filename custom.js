$(function () {
    'use strict'

    /* Settings. */
    const showStartLocationMarker = true // Show a marker on the map's start location. Default: true.
    const isStartLocationMarkerMovable = true // Let the user move the start location marker around. Default: true.
    const showUserLocationMarker = true // Show a marker on the visitor's location. Default: true.

    const scaleByRarity = true // Enable scaling by rarity. Default: true.
    const upscalePokemon = false // Enable upscaling of certain Pokemon (upscaledPokemon and notify list). Default: false.
    const upscaledPokemon = [] // Add Pokémon IDs separated by commas (e.g. [1, 2, 3]) to upscale icons. Default: [].

    var firebaseConfig = {
        apiKey: "AIzaSyDRk1viCyGqsZGjFbr0_3GhXJ-8DhILHF4",
        authDomain: "pokemap-a7a18.firebaseapp.com",
        databaseURL: "https://pokemap-a7a18.firebaseio.com",
        projectId: "pokemap-a7a18",
        storageBucket: "",
        messagingSenderId: "527671004409",
        appId: "1:527671004409:web:96746613d29e801e"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // Google Analytics property ID. Leave empty to disable.
    // Looks like 'UA-XXXXX-Y'.
    const analyticsKey = ''

    // Hide Presets
    const hidepresets = [
        {
            PokemonID: 149,
            Name: "Dragon Types Only",
            Searchstring: ['Dragon'],
            Invert: true
        },
        {
            PokemonID: 230,
            Name: "Water Types Only",
            Searchstring: ['Water'],
            Invert: true
        },
        {
            PokemonID: 208,
            Name: "Steel Types Only",
            Searchstring: ['Steel'],
            Invert: true
        },
        {
            PokemonID: 25,
            Name: "Electric Types Only",
            Searchstring: ['Electric'],
            Invert: true
        },
        {
            PokemonID: 4,
            Name: "Fire Types Only",
            Searchstring: ['Fire'],
            Invert: true
        },
        {
            PokemonID: 198,
            Name: "Dark Types Only",
            Searchstring: ['Dark'],
            Invert: true
        },
        {
            PokemonID: 10,
            Name: "Bug Types Only",
            Searchstring: ['Bug'],
            Invert: true
        },
        {
            PokemonID: 16,
            Name: "Normal Types Only",
            Searchstring: ['Normal'],
            Invert: true
        },
        {
            PokemonID: 66,
            Name: "Fighting Types Only",
            Searchstring: ['Fighting'],
            Invert: true
        },
        {
            PokemonID: 92,
            Name: "Ghost Types Only",
            Searchstring: ['Ghost'],
            Invert: true
        },
        {
            PokemonID: 63,
            Name: "Psychic Types Only",
            Searchstring: ['Psychic'],
            Invert: true
        },
        {
            PokemonID: 12,
            Name: "Flying Types Only",
            Searchstring: ['Flying'],
            Invert: true
        },
        {
            PokemonID: 1,
            Name: "Grass Types Only",
            Searchstring: ['Grass'],
            Invert: true
        },
        {
            PokemonID: 29,
            Name: "Poison Types Only",
            Searchstring: ['Poison'],
            Invert: true
        },
        {
            PokemonID: 35,
            Name: "Fairy Types Only",
            Searchstring: ['Fairy'],
            Invert: true
        },
        {
            PokemonID: 364,
            Name: "Ice Types Only",
            Searchstring: ['Ice'],
            Invert: true
        },
        {
            PokemonID: 1,
            Name: "Generation 1 Only",
            Searchstring: ['gen1'],
            Invert: true
        },
        {
            PokemonID: 152,
            Name: "Generation 2 Only",
            Searchstring: ['gen2'],
            Invert: true
        },
        {
            PokemonID: 252,
            Name: "Generation 3 Only",
            Searchstring: ['gen3'],
            Invert: true
        },
        {
            PokemonID: 387,
            Name: "Generation 4 Only",
            Searchstring: ['gen4'],
            Invert: true
        }
    ]


    // MOTD.
    const motdEnabled = false
    const motdTitle = 'MOTD'
    const motd = 'Hi there! This is an easily customizable MOTD with optional title!'

    // LOGIN
    const loginEnabled = true

    // Only show every unique MOTD message once. If disabled, the MOTD will be
    // shown on every visit. Requires support for localStorage.
    // Updating only the MOTD title (and not the text) will not make the MOTD
    // appear again.
    const motdShowOnlyOnce = true

    // What pages should the MOTD be shown on? By default, homepage and mobile
    // pages.
    const motdShowOnPages = [
        '/',
        '/mobile'
    ]

    // Clustering! Different zoom levels for desktop vs mobile.
    const disableClusters = false // Default: false.
    const maxClusterZoomLevel = 14 // Default: 14.
    const maxClusterZoomLevelMobile = 14 // Default: 14.
    const clusterZoomOnClick = false // Default: false.
    const clusterZoomOnClickMobile = false // Default: 14.
    const clusterGridSize = 60 // Default: 60.
    const clusterGridSizeMobile = 60 // Default: 60.

    // Rarities Sprites
    const rarityCommon = 12 // Default: 1.
    const rarityUncommon = 20 // Default: 1.
    const rarityRare = 100 // Default: 1.
    const rarityVeryRare = 147 // Default: 1.
    const rarityUltraRare = 149 // Default: 1.
    const rarityNewSpawn = 151 // Default: 1.

    // Process Pokémon in chunks to improve responsiveness.
    const processPokemonChunkSize = 100 // Default: 100
    const processPokemonIntervalMs = 100 // Default: 100ms
    const processPokemonChunkSizeMobile = 100 // Default: 100.
    const processPokemonIntervalMsMobile = 100 // Default: 100ms.

    /* Feature detection. */

    const hasStorage = (function () {
        var mod = 'RocketMap'
        try {
            localStorage.setItem(mod, mod)
            localStorage.removeItem(mod)
            return true
        } catch (exception) {
            return false
        }
    }())


    /* Do stuff. */

    const currentPage = window.location.pathname
    // Marker cluster might have loaded before custom.js.
    const isMarkerClusterLoaded = typeof window.markerCluster !== 'undefined' && !!window.markerCluster

    // Set custom Store values.
    Store.set('maxClusterZoomLevel', maxClusterZoomLevel)
    Store.set('clusterZoomOnClick', clusterZoomOnClick)
    Store.set('clusterGridSize', clusterGridSize)
    Store.set('processPokemonChunkSize', processPokemonChunkSize)
    Store.set('processPokemonIntervalMs', processPokemonIntervalMs)
    Store.set('scaleByRarity', scaleByRarity)
    Store.set('upscalePokemon', upscalePokemon)
    Store.set('upscaledPokemon', upscaledPokemon)
    Store.set('showStartLocationMarker', showStartLocationMarker)
    Store.set('isStartLocationMarkerMovable', isStartLocationMarkerMovable)
    Store.set('showLocationMarker', showUserLocationMarker)
    Store.set('hidepresets', hidepresets)

    // Set rarities sprites
    Store.set('rarityCommon', rarityCommon)
    Store.set('rarityUncommon', rarityUncommon)
    Store.set('rarityRare', rarityRare)
    Store.set('rarityVeryRare', rarityVeryRare)
    Store.set('rarityUltraRare', rarityUltraRare)
    Store.set('rarityNewSpawn', rarityNewSpawn)

    if (typeof window.orientation !== 'undefined' || isMobileDevice()) {
        Store.set('maxClusterZoomLevel', maxClusterZoomLevelMobile)
        Store.set('clusterZoomOnClick', clusterZoomOnClickMobile)
        Store.set('clusterGridSize', clusterGridSizeMobile)
        Store.set('processPokemonChunkSize', processPokemonChunkSizeMobile)
        Store.set('processPokemonIntervalMs', processPokemonIntervalMsMobile)
    }

    if (disableClusters) {
        Store.set('maxClusterZoomLevel', -1)
    }

    // Google Analytics.
    if (analyticsKey.length > 0) {
        window.ga = window.ga || function () {
            (ga.q = ga.q || []).push(arguments)
        }
        ga.l = Date.now
        ga('create', analyticsKey, 'auto')
        ga('send', 'pageview')
    }

    // Show MOTD.
    if (motdEnabled && motdShowOnPages.indexOf(currentPage) !== -1) {
        let motdIsUpdated = true

        if (hasStorage) {
            const lastMOTD = window.localStorage.getItem('lastMOTD') || ''

            if (lastMOTD === motd) {
                motdIsUpdated = false
            }
        }

        if (motdIsUpdated || !motdShowOnlyOnce) {
            window.localStorage.setItem('lastMOTD', motd)

            swal({
                title: motdTitle,
                text: motd
            })
        }
    }

     // Handles the sign in button press.

    function toggleSignIn() {
        if (firebase.auth().currentUser) {
            // [START signout]
            firebase.auth().signOut();
            // [END signout]
        } else {
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;
            if (email.length < 4) {
                alert('Please enter an email address.');
                return;
            }
            if (password.length < 4) {
                alert('Please enter a password.');
                return;
            }
            // Sign in with email and pass.
            // [START authwithemail]
            firebase.auth().signInWithEmailAndPassword(email, password).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // [START_EXCLUDE]
                if (errorCode === 'auth/wrong-password') {
                    alert('Wrong password.');
                } else {
                    alert(errorMessage);
                }
                console.log(error);
                document.getElementById('quickstart-sign-in').disabled = false;
                // [END_EXCLUDE]
            });
            // [END authwithemail]
        }
        document.getElementById('quickstart-sign-in').disabled = true;
    }

    // Handle signup button press
    function handleSignUp() {
        var email = document.getElementById('email').value;
        var password = document.getElementById('password').value;
        if (email.length < 4) {
            alert('Please enter an email address.');
            return;
        }
        if (password.length < 4) {
            alert('Please enter a password.');
            return;
        }
        // Sign in with email and pass.
        // [START createwithemail]
        firebase.auth().createUserWithEmailAndPassword(email, password).catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // [START_EXCLUDE]
            if (errorCode == 'auth/weak-password') {
                alert('The password is too weak.');
            } else {
                alert(errorMessage);
            }
            console.log(error);
            // [END_EXCLUDE]
        });
        // [END createwithemail]
    }

    // Firebase Login
    if (loginEnabled) {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-info'
            },
            buttonsStyling: false,
        })

        swalWithBootstrapButtons.fire({
            title: 'Sign In',
            html:
                '<input type="text" id="email" name="email" placeholder="Email" class="swal2-input">' +
                '<input type="password" id="password" name="password" placeholder="Password" class="swal2-input>',
            showCancelButton: true,
            confirmButtonText: 'Sign In',
            cancelButtonText: 'Sign Up',
            focusComfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('emai').value,
                    document.getElementById('password').value
                ]
            }
        }).then((result) => {
            if (result.value) {
                swalWithBootstrapButtons.fire(
                    toggleSignIn()
                )
            } else if (
                // Read more about handling dismissals
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    handleSignUp()
                )
            }
        })
    }
})
