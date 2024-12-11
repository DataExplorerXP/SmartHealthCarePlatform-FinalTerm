import {Alert} from "react-native";
import * as Location from 'expo-location';
import axios from 'axios';
import metajson from "./META.json";

export async function getWeather() {
  try {
    //위치 정보 얻기 -> https://docs.expo.dev/versions/latest/sdk/location/
    request_status = await Location.requestForegroundPermissionsAsync();
    if (request_status.status !== 'granted') {
      Alert.alert("위치 정보 권한이 허용되지 않았습니다.");
      return {};
    }
    const location = await Location.getCurrentPositionAsync();
    const {latitude,longitude} =location.coords;
    const keys=Object.keys(metajson);
    var nearest=10000;
    var nearest_key;
    for(var i=0;i<keys.length;i+=1){
      const key=keys[i];
      const t_json=metajson[key][0];
      const t_distance=(latitude-t_json.latitude)**2+(longitude-t_json.altitude)**2; // 철자 틀림...
      if(nearest>t_distance){
        nearest=t_distance;
        nearest_key=key;
      }
    }
    
    stn=nearest_key;

    // 날씨 정보 얻기 -> https://apihub.kma.go.kr/
    const API_KEY = "APIKEY";
    const result = await axios.get(
      `https://apihub.kma.go.kr/api/typ01/url/kma_sfctm2.php?stn=${stn}&help=0&authKey=${API_KEY}`
    );
    return result;

  } catch (error) {
    Alert.alert("에러가 발생했습니다. 통신상태를 확인 후 다시 리로드해주십시오!!");
    return {};
  }
}