import { HostObject } from "@amazon-sumerian-hosts/babylon";
import { Scene } from "@babylonjs/core/scene";
import DemoUtils from "./demo-utils";
import { cognitoIdentityPoolId, apiGatewayEndpoint } from "./demo-credentials.js";
import axios from 'axios';
const LanguageDetect = require('languagedetect');
const lngDetector = new LanguageDetect();

let host;
let scene;
let trimResponse = false;
let userInput;
let typeOfInputRequest="Welcome to sentence completeion mode";

async function createScene() {
  // Create an empty scene. Note: Sumerian Hosts work with both
  // right-hand or left-hand coordinate system for babylon scene
  scene = new Scene();

  const { shadowGenerator } = DemoUtils.setupSceneEnvironment(scene);
  initUi();

  // ===== Configure the AWS SDK =====

  const region = cognitoIdentityPoolId.split(":")[0];
  AWS.config.region = region;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: cognitoIdentityPoolId,
  });

  // ===== Instantiate the Sumerian Host =====

  // Edit the characterId if you would like to use one of
  // the other pre-built host characters. Available character IDs are:
  // "Cristine", "Fiona", "Grace", "Maya", "Jay", "Luke", "Preston", "Wes"
  const characterId = "Cristine";
  const pollyConfig = { pollyVoice: "Joanna", pollyEngine: "neural" };
  const characterConfig = HostObject.getCharacterConfig(
    "./assets/character-assets",
    characterId
  );
  
  host = await HostObject.createHost(scene, characterConfig, pollyConfig);

  // Tell the host to always look at the camera.
  host.PointOfInterestFeature.setTarget(scene.activeCamera);

  // Enable shadows.
  scene.meshes.forEach((mesh) => {
    shadowGenerator.addShadowCaster(mesh);
  });
  const v1="Hi My name is Christine an AlexaTM Host. Please enter in textbox to talk to me";
  host.TextToSpeechFeature.play(v1);
  return scene;
}

function initUi() {
  document.getElementById("speakButton").onclick = speak.bind(this);
}

async function speak() {
  const textInput = document.getElementById("speechText").value;
  let isEnglish = false;
  if (lngDetector.detect(textInput)[0][0] === 'english' 
  || lngDetector.detect(textInput)[0][0] === 'pidgin' 
  || lngDetector.detect(textInput)[0][0] ===  'hawaiian'){
    isEnglish=true;
  }
  
  console.log(`isEnglish ${isEnglish}`);    

//case: 1-shot natural language generation
if (withBrackets(textInput)){
  trimResponse = true;
  typeOfInputRequest = "Welcome to natural language generation mode";
  console.log(`input with brackets: ${textInput}`);
  console.log('use 1-shot natural language generation');

  const trainInp = "name[The Punter], food[Indian], priceRange[cheap]";
  const trainOut = "The Punter provides Indian food in the cheap price range.";

  userInput = `[CLM] ${trainInp} ==> sentence describing the place: ${trainOut} ; ${textInput} ==> sentence describing the place:`;
  console.log(`Model input: ${userInput}\n`);
  
}
 //case: use 4.3. 1-shot machine translation
if(!withBrackets(textInput) && !isEnglish){
  trimResponse = true;
  typeOfInputRequest = "Welcom to machine translation mode";
  const trainInp = "Das Parlament erhebt sich zu einer Schweigeminute.";
  const trainOut = "The House rose and observed a minute' s silence";
  const testOut = "Membership of Parliament: see Minutes;"; 
  
  userInput = `[CLM] ${trainInp};Translation in English: ${trainOut} ; Sentence: ${textInput}; Translation in English:`;
  console.log(`machine translation: ${textInput}`);
  console.log(`Model input: ${userInput}\n`);
  console.log(`Ground truth: ${testOut}`);
} 
// case : Query endpoint and parse response. Complete sentence
if (!withBrackets(textInput) && isEnglish){
  typeOfInputRequest="Welcom to sentence completion mode";
  trimResponse = false;
  userInput=textInput;
}

  try {
    const response = await axios.post(
      apiGatewayEndpoint,
      { "data": JSON.stringify(userInput) }
    );
    // Decode the body of the response.
    const responseBody = JSON.parse(response.data.body);
    const generatedText = responseBody.generated_text;
    console.log(generatedText);
    //dont trim if it is complete sentence
    const speech = trimResponse ? generatedText.split(";")[0] : generatedText;
    
    // Speak the generated text.
    await host.TextToSpeechFeature.play(typeOfInputRequest);
    await host.TextToSpeechFeature.play(speech);
    const v2="What do you want to do next";
    await host.TextToSpeechFeature.play(v2);

  } catch (err) {
    console.error(err, err.stack);
    host.TextToSpeechFeature.play(
      "There was a problem completing your request. View your browser's console log for details."
    );
  }
}


function withBrackets(input) {
  // Regular expression to check brackets
  const hasBrackets = /\[.*?\]/.test(input);
  return hasBrackets;
}

DemoUtils.loadDemo(createScene);
