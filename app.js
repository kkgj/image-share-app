var firebaseConfig = {
	apiKey: "AIzaSyACkYvm8t9vAscandf08M14DWcpSMXtOZA",
	authDomain: "chat-app--desktop-version.firebaseapp.com",
	databaseURL: "https://chat-app--desktop-version.firebaseio.com",
	projectId: "chat-app--desktop-version",
	storageBucket: "chat-app--desktop-version.appspot.com",
	messagingSenderId: "224944114456",
	appId: "1:224944114456:web:5a8dc6e843fb8cab876c6d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get element that is the input we will click to upload images
const uploadButton = document.querySelector('#upload-button')

// Get element that shows the progress of the image uploading action
const progressBar = document.querySelector('progress')

// imageFile is global so we can access it after it uploads
let imageFile

// Event listener for if upload image button is clicked and a file has been selected
uploadButton.addEventListener('change', (event) => {

	// Access the chosen file through the event
	let file = event.target.files[0];

	// Define a var just for the name of the file
	let name = event.target.files[0].name;

	// Create a storage reference to the database using the name of the chosen file
	let storageRef = firebase.storage().ref(name)

	// Attach the put method to the storageRef 
	storageRef.put(file).on("state_changed",
		snapshot => {
			let percentage = Number(snapshot.bytesTransferred / snapshot.totalBytes * 100).toFixed(0)
			progressBar.value = percentage
		},
		error => {
			console.log('error', error.message)
		},
		() => {

			// Once upload is complete make a second request to get the download URL
			storageRef.put(file).snapshot.ref.getDownloadURL()
				.then((url) => {
					// We now have the uploaded url 
					console.log(url);

					// Every time we upload a image we also need to add a reference to the database
					firebase.firestore().collection('images').add({
						url: url
					})
						.then(success => console.log(success))
						.catch(error => console.log(error))

					// reset the progress bar to zero percent after one second
					setTimeout(() => {
						progressBar.removeAttribute('value')
					}, 1000)
				})
		})
})

// listen to database in the images collection. Loop through returned data to create image elements
firebase.firestore().collection('images').onSnapshot(snapshot => {
	document.querySelector('#images').innerHTML = ""
	snapshot.forEach(each => {
		console.log(each.data().url);
		let div = document.createElement('div')
		let image = document.createElement('img')
		image.setAttribute('src', each.data().url)
		div.append(image)
		document.querySelector('#images').append(div)
	})
})

document.querySelector('#clear').addEventListener('click', () => {
	firebase.firestore().collection('images').get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				firebase.firestore().collection('images').doc(doc.id).delete()
					.then(() => {
						console.log('Successfully deleted!')
					}).catch(function (error) {
						console.error("Error removing document: ", error);
					})
			})
		}).catch(function (error) {
			console.error("Error removing document: ", error);
		})
})

