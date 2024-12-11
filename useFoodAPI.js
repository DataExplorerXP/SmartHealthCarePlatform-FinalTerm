import React from 'react';
import {Alert} from 'react-native'
import axios from 'axios';
// 반드시 실제 API 키로 대체해야 합니다.
const API_KEY = 'API KEY';

export async function fetchKoreanNutritionData(foodName) {
  if (foodName==""){return []}
  const url =
    'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo01/getFoodNtrCpntDbInq01?serviceKey='
    +API_KEY+'&type=json&FOOD_NM_KR=' +
    encodeURIComponent(foodName);
  try {
    const response = await axios.get(url,{ timeout: 10000 });
    const body=response.data.body;
    if(body.totalCount==0){return []}
    else {return body.items}
  } catch (error) {
    Alert('영양 정보 가져오기 오류:', error);
    return [];
  }
}
export function processSelectedJson(json){
  const foodname=json["FOOD_NM_KR"]
  const cal=json["AMT_NUM1"]
  const protein=json["AMT_NUM3"]
  const fat=json["AMT_NUM4"]
  const carbon_hydrate=json["AMT_NUM7"]
  const sugar=json["AMT_NUM8"]
  const sodium=json["AMT_NUM14"]
  const unitSize=json["SERVING_SIZE"]
  const result={
    "name":foodname,
    "unitSize":unitSize,
    "calorie":cal,
    "protein":protein,
    "fat":fat,
    "carbon_hydrate":carbon_hydrate,
    "sugar":sugar,
    "sodium":sodium
  }
  return result
}