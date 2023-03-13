import React, { Component } from 'react';
import ParticlesBg from 'particles-bg'
import './App.css';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';

const app = new Clarifai.App({
	apiKey: 'fc0c7f5630c2462db0739a5998abe9bb'
});

class App extends Component {
	constructor() {
		super();
		this.state = {
			input: '',
			imageURL: '',
			box: {},
			route: 'signin',
			isSignedIn: false,
			user: {
				id: '',
				name: '',
				email: '',
				entries: 0,
				joined: ''
			}

		}
	}

	loadUser = (data) => {
		this.setState({user: {
			id: data.id,
			name: data.name,
			email: data.email,
			entries: data.entries,
			joined: data.joined
		}})
	}
	
	calculateFaceLocation = (data) => {
		const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
		const image = document.getElementById('inputImage');
		const width = Number(image.width);
		const height = Number(image.height);
		return {
			leftCol: clarifaiFace.left_col * width,
			rightCol: width - (clarifaiFace.right_col * width),
			topRow: clarifaiFace.top_row * height,
			bottomRow: height - (clarifaiFace.bottom_row * height)
		}
	}

	displayFaceBox = (box) => {
		console.log(box);
		this.setState({box: box});

	}

	onInputChange = (event) => {
		  this.setState({input:event.target.value});
	}

	onButtonSubmit = () => {
		 this.setState({imageURL: this.state.input})
		//  let r = '';
		 app.models
      		.predict(
			{
			id: 'face-detection',
			name: 'face-detection',
			version: '6dc7e46bc9124c5c8824be4822abe105',
			type: 'visual-detector',
			}, this.state.input)

			 ///////////////////////////////////////////////////////////////////////////////////////////////////
		// In this section, we set the user authentication, user and app ID, model details, and the URL
		// of the image we want as an input. Change these strings to run your own example.
		//////////////////////////////////////////////////////////////////////////////////////////////////

		// Your PAT (Personal Access Token) can be found in the portal under Authentification
		const PAT = '2ff45b2a47f34be1ac970a9c02387f6c';
		// Specify the correct user_id/app_id pairings
		// Since you're making inferences outside your app's scope
		const USER_ID = 'clops_4141';       
		const APP_ID = 'RecognitionBrain';
		// Change these to whatever model and image URL you want to use
		const MODEL_ID = 'face-detection';
		// const MODEL_VERSION_ID = '45fb9a671625463fa646c3523a3087d5';    
		const IMAGE_URL = this.state.input;

		///////////////////////////////////////////////////////////////////////////////////
		// YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
		///////////////////////////////////////////////////////////////////////////////////

		const raw = JSON.stringify({
			"user_app_id": {
				"user_id": USER_ID,
				"app_id": APP_ID
			},
			"inputs": [
				{
					"data": {
						"image": {
							"url": IMAGE_URL
						}
					}
				}
			]
		});

		const requestOptions = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Key ' + PAT
			},
			body: raw
			
		};

		// NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
		// https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
		// this will default to the latest version_id

		fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/outputs", requestOptions)
			.then(response => response.json())
			.then(result => {
				if (result) {
					fetch('http://localhost:3000/image', {
						method: 'put',
						headers: {'content-Type': 'application/json'},
						body: JSON.stringify({
							id: this.state.user.id,
						})
					})
					.then(result => result.json())
					.then(count => {
						this.setState(Object.assign(this.state.user, {entries: count}))
					})
				}
				//JSON.stringify(result.outputs[0].data.regions[0].region_info.bounding_box
				this.displayFaceBox(this.calculateFaceLocation(result));
			}).catch(error => console.log('error', error));
		
		// console.log(r);

	};
	
	onRouteChange = (route) => {
		if( route === 'signout') {
			this.setState({isSignedIn: false})
		} else if(route === 'home') {
			this.setState({isSignedIn: true})
		}
		this.setState({route: route});
	}
	render() {
		
		return ( 
			
			<div className="tc App">  
			<ParticlesBg type="cobweb" num="200" color="#ffffff" bg={true} />
			<Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
			{this.state.route === 'home'
				?<div>
					<Logo /> 
					<Rank name={this.state.user.name} entries={this.state.user.entries}/>
					<ImageLinkForm 
						onInputChange={this.onInputChange} 
						onButtonSubmit={this.onButtonSubmit}/>
					<FaceRecognition box={this.state.box} imageURL={this.state.imageURL}/> 
				</div>

				: (
					this.state.route === 'signin'
						?<SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
						:<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
						
				)
			}
			</div>
	  );
	}
	
}

export default App;
