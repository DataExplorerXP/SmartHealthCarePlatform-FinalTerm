import React, { useEffect, useState, createContext, useContext,useRef } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert, Image,
        TouchableOpacity,TextInput, FlatList, Modal} from 'react-native';
import {getWeather} from './useWeatherAPI';
import{ NavigationContainer} from'@react-navigation/native'; // 네비게이션컨테이너
import{ createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem} from'@react-navigation/drawer'; // Drawer 네비게이션
import{ WebView} from'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {fetchKoreanNutritionData,processSelectedJson} from './useFoodAPI';
import Constants from 'expo-constants';
import axios from 'axios';
import { Calendar } from 'react-native-calendars';
import Checkbox from 'expo-checkbox';
const P1="오늘의 날씨"
const P2="추천 운동"
const P3="섭취 식품"
const P4="운동 달력"
const P5="식단 달력"
const P6="계정 관리"
const BASE_URL="https://SOMEDNS"

function getOnlyTHR(data) {
  values=data.split("\n")[4];
  while(values.indexOf("  ")!=-1){
    values=values.replace("  "," ");
  }
  value_list=values.split(" ")
  ta=value_list[11]; // 기온: C
  hm=value_list[13]; // 습도: %
  rn=value_list[15]; //강수량: mm
  return [ta, hm, rn];
}
// GPT 구간 시작
export const WeatherContext = createContext();
export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState([]);

  const updateWeather = async () => {
    const weatherData = await getWeather(); // 비동기 데이터 가져오기
    setWeather(getOnlyTHR(weatherData.data));      // 가져온 데이터 처리 및 상태 업데이트
  };

  useEffect(() => {
    updateWeather();
    // setWeather([30, 27, -9]); // 테스트
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, setWeather }}>
      {children}
    </WeatherContext.Provider>
  );
};
// gpt 구간 끝

function Page1({navigation, route}) {
  const { weather } = useContext(WeatherContext);
  const { randomKey,userid,email } = route.params;
  const DI=weather[0] - 0.55*( 1 - 0.01 * weather[1] ) * ( weather[0] - 14.5);
  // const DI=32
  var s_DI;
  if(DI<=21){
    s_DI="모두가 쾌적"
  }else if(DI<=24){
    s_DI="절반 미만이 불쾌"
  }else if(DI<=27){
    s_DI="절반 이상이 불쾌"
  }else if(DI<=32){
    s_DI="대부분이 불쾌"
  }else{
    s_DI="모두가 불쾌"
  }
  const t_DI=<Text style={styles.discomfort_index}>불쾌지수: 한국인 {s_DI}합니다!!</Text>;
  if(weather[2]>0){
    return(
      <View>
        <Image style={styles.recommandImage} source={require("./assets/rain.jpg")}/>
        {t_DI}
        <Text style={styles.recommandText}>비가 내리네요... 감성 충만한 날이니 요가 어떠신가요?</Text>
      </View>
    )
  }else if(weather[0]>=33){
    return(
      <View>
        <Image style={styles.recommandImage} source={require("./assets/tooHot.jpg")}/>
        {t_DI}
        <Text style={styles.alertText}>폭염(33도 이상)입니다!! 야외활동을 삼가시고 물을 자주 마시길 바랍니다!</Text>
      </View>
    )
  }else if(DI<=21){
    return(
      <View>
        <Image style={styles.recommandImage} source={require("./assets/runningman.webp")}/>
        {t_DI}
        <Text style={styles.recommandText}>운동하는 데 있어 최고의 날씨네요! 달리기 어떠신가요?</Text>
      </View>
    );
  }else if(DI<=24){
    return(
      <View>
        <Image style={styles.recommandImage} source={require("./assets/jogging.jpg")}/>
        {t_DI}
        <Text style={styles.recommandText}>운동하기 괜찮은 날씨네요! 조깅 어떠신가요?</Text>
      </View>
    );
  }else if(DI<=27){
    return(
      <View>
        <Image style={styles.recommandImage} source={require("./assets/strolling.jpg")}/>
        {t_DI}
        <Text style={styles.recommandText}>가벼운 운동도 좋을 것 같아요!! 산책 어떠신가요?</Text>
      </View>
    )
  }else if(27<DI){
    return(
      <View>
        <Image style={styles.recommandImage} source={require("./assets/arm.jpg")}/>
        {t_DI}
        <Text style={styles.recommandText}>운동하기 쉽지 않은 날씨네요^^;;... 실내 운동은 어떠신가요?</Text>
      </View>
    );
  }
}
function Page2({ navigation, route }) {
  const { weather } = useContext(WeatherContext);
  const { randomKey,userid,email } = route.params;
  const DI=weather[0] - 0.55*( 1 - 0.01 * weather[1] ) * ( weather[0] - 14.5);
  // const DI=32
  if(weather[2]>0){
    return(
      <SafeAreaView style={styles.safearea}>
        <WebView style={styles.webview} source={{uri:"https://www.youtube.com/watch?v=OBTl49bVk94"}}/>
      </SafeAreaView>
    )
  }else if(weather[0]>=33){
    return(
      <SafeAreaView style={styles.safearea}>
        <WebView style={styles.webview} source={{uri:"https://www.youtube.com/watch?v=MInkPcfcYG8"}}/>
      </SafeAreaView>
    )
  }else if(DI<=21){
    return(
      <SafeAreaView style={styles.safearea}>
        <WebView style={styles.webview} source={{uri:"https://www.youtube.com/watch?v=jMc_0h9vcN0"}}/>
      </SafeAreaView>
    );
  }else if(DI<=24){
    return(
      <SafeAreaView style={styles.safearea}>
        <WebView style={styles.webview} source={{uri:"https://www.youtube.com/watch?v=C95JX4atgIQ"}}/>
      </SafeAreaView>
    );
  }else if(DI<=27){
    return(
      <SafeAreaView style={styles.safearea}>
        <WebView style={styles.webview} source={{uri:"https://www.youtube.com/watch?v=tva-WJyZoeg"}}/>
      </SafeAreaView>
    )
  }else if(27<DI){
    return(
      <SafeAreaView style={styles.safearea}>
        <WebView style={styles.webview} source={{uri:"https://www.youtube.com/watch?v=-_DUjHxgmWk"}}/>
      </SafeAreaView>
    );
  }
}
function splitNumberAndUnit(input) {
    const match = input.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/);
    if (match) {
        return {
            number: parseFloat(match[1]), // 숫자는 float로 변환
            unit: match[2] // 단위는 그대로 반환
        };
    } else {
        throw new Error("Invalid format: input must be in 'number+unit' format.");
    }
}
function calculateValue(value, unit, weight) {
  // value를 float로 변환
  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return null;
  }

  // 기본적으로 g 단위 설정
  let unitMultiplier = 1; 
  let unitSize = splitNumberAndUnit(unit)["number"];

  // 단위 크기가 숫자가 아닌 경우 처리
  if (isNaN(unitSize)) {
    throw new Error("Invalid unit size: must contain a numeric value before the unit");
  }

  // 최종 계산
  const result = numericValue * weight * unitMultiplier / unitSize;

  // 문자열로 반환
  return result.toString();
}
function getCurrentDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
function Page3({navigation, route}){
  const { randomKey,userid,email,setLogined } = route.params;
  const [foodName, setFoodName] = useState('');
  const [nutritionData, setNutritionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeover,setTimeover]=useState(false)
  const [weight,setWeight]=useState(0)
  const [inputWeight, setInputWeight]=useState("")
  const [consumedFood,setConsumedFood]=useState({})
  const [prevSendedData,setPrevSendedData]=useState({})
  const [isSendBtnModeCancel,setIsSendBtnModeCancel]=useState(false)
  const [sendBtnText,setSendBtnText]=useState("데이터 전송")
  const [selectedDate,setSelectedDate]=useState(getCurrentDate())
  const [modalVisible,setModalVisible]=useState(false)
  useEffect(()=>{
    if(isSendBtnModeCancel){
      setSendBtnText("전송 취소")
    }else{
      setSendBtnText("데이터 전송")
    }
  },[isSendBtnModeCancel])
  const handleFetchData = async () => {
    setLoading(true);
    setTimeover(false);  // 이전 타이머를 초기화
    setWeight(0)
    setInputWeight("")
    setIsSendBtnModeCancel(false)
    const timer = setTimeout(() => {
      setTimeover(true);  // 5초 이상 소요되면 timeover를 true로 설정
      setLoading(false);  // 로딩 상태 종료
    }, 10000);  // 10초
    setConsumedFood({})
    try {
      const data = await fetchKoreanNutritionData(foodName);
      clearTimeout(timer);  // 데이터가 잘 받아지면 타이머를 취소
      setNutritionData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      clearTimeout(timer);  // 에러 발생 시에도 타이머를 취소
    } finally {
      setLoading(false);
    }
  };
  const processNutritionData=(inputWeight)=>{
    setWeight(inputWeight)
    setConsumedFood({
      "name":nutritionData.name,
      "calorie":calculateValue(nutritionData.calorie, nutritionData.unitSize, inputWeight),
      "protein":calculateValue(nutritionData.protein, nutritionData.unitSize, inputWeight),
      "fat":calculateValue(nutritionData.fat, nutritionData.unitSize, inputWeight),
      "carbon_hydrate":calculateValue(nutritionData.carbon_hydrate, nutritionData.unitSize, inputWeight),
      "sugar":calculateValue(nutritionData.sugar, nutritionData.unitSize, inputWeight),
      "sodium":calculateValue(nutritionData.sodium, nutritionData.unitSize, inputWeight)
    })
  }
  const sendFoodData= async()=>{
    const JSON_URL=BASE_URL+"food/manage/"
    if(!isSendBtnModeCancel){
      if(weight==0){
        Alert.alert("무게를 입력해주십시오.")
        return;
      }
      let nullProcessed=consumedFood;
      for(var key of ["calorie","protein","fat","carbon_hydrate","sugar","sodium"]){
        nullProcessed[key]=nullProcessed[key]==null?0:Number(nullProcessed[key])
      }
      const postData={
        date:selectedDate,
        userid:userid,
        consumed_foods:nullProcessed
      }
      await axios.post(JSON_URL,postData,{
        headers: { "Content-Type": "application/json","Random-Key":randomKey}
      }).then(res =>{
        if (res.status === 201) {
          setPrevSendedData(res.data)
          Alert.alert("데이터 전송 성공")
        } else{
          Alert.alert("업데이트 필요")
        }
      }).catch(err =>{
        if(err.response){
          if (err.response.status === 401) {
              Alert.alert("다시 로그인 해주십시오")
              setLogined(false)
            } else if (err.response.status===400){
              Alert.alert("올바르지 않은 JSON")
            } else{
              Alert.alert(err.response.status.toString())
            }
        }else{
          Alert.alert("네트워크에 접속되지 않았습니다.")
        }
      })
      setIsSendBtnModeCancel(true)
    }else{
      const postData={
        "date":prevSendedData.date,
        "consumed_foods":[prevSendedData.index],
        "userid":userid
      }
      await axios.delete(JSON_URL, {
        data: postData, // 데이터를 config 객체의 data 속성에 포함
        headers: {
          "Content-Type": "application/json",
          "Random-Key": randomKey,
        },
      }).then(res =>{
        if (res.status === 204) {
          setPrevSendedData({})
          Alert.alert("데이터 삭제 성공")
        } else{
          Alert.alert("업데이트 필요")
        }
      }).catch(err =>{
        if(err.response){
          if (err.response.status === 401) {
              Alert.alert("다시 로그인 해주십시오")
              setLogined(false)
            } else if (err.response.status===400){
              if(!err.response.data.valError){
                Alert.alert("올바르지 않은 JSON")
              }else{
                Alert.alert("앱을 잘못 작성했군요....")
              }
            } else if (err.response.status===404){
              Alert.alert("지울 데이터가 없습니다.")
            }else{
              Alert.alert(err.response.status.toString())
            }
        }else{
          Alert.alert("네트워크에 접속되지 않았습니다.")
        }
      })
      setIsSendBtnModeCancel(false)
    }
  };
  const setProcessed = ({json})=>{
    setNutritionData(processSelectedJson(json))
  }
  const setEmpty=()=>{
    setNutritionData([])
  }
  const Item = ({ json }) => (
    <View style={styles.item}>
      <ScrollView>
        <Text>{json["FOOD_NM_KR"]}</Text>
      </ScrollView>
      <TouchableOpacity style={styles.button} onPress={()=>setProcessed({json})}>
        <Text>선택</Text>
      </TouchableOpacity>
    </View>
  );
  const getOnlyName=({item})=>(
    <Item json={item}/>
  );
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(false)
  }
  return(
    <SafeAreaView style={styles.safearea}>
      <View style={styles.section}>
        <Text>{selectedDate}</Text>
        <TouchableOpacity style={styles.modalButton} 
          onPress={()=>{setModalVisible(true)}}>
          <Text>날짜 선택</Text>
        </TouchableOpacity>
      </View>
      {/* Modal for displaying selected date */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Calendar
          onDayPress={onDayPress} // 날짜 선택 시 호출
        />
        <TouchableOpacity style={styles.searchbutton} 
          onPress={()=>{setModalVisible(false)}}>
          <Text>닫기</Text>
        </TouchableOpacity>
      </Modal>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginVertical: 10,
          paddingHorizontal: 5,
        }}
        placeholder="섭취한 음식명을 한글로 적어주세요!! 예: 사과"
        value={foodName}
        onChangeText={(text) => setFoodName(text)}
      />
      <TouchableOpacity style={loading?styles.searchbuttonLoading:styles.searchbutton} 
        onPress={handleFetchData} disabled={loading}>
        <Text>{timeover?"시간 초과":loading?"로딩 중":"검색"}</Text>
      </TouchableOpacity>
      <ScrollView>
        {Array.isArray(nutritionData)?nutritionData.length > 0 ? (
          <FlatList
            data={nutritionData}
            renderItem={(item)=>getOnlyName(item)}
            keyExtractor={item => item["NUM"]}
          />
        ) : null
        :(
          <View style={styles.container}>
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>섭취한 무게: {weight.toString()+"("+splitNumberAndUnit(nutritionData.unitSize)["unit"]+")"}</Text>
              <Text style={styles.infoText}>제품명: {nutritionData.name || 'N/A'}</Text>
              <Text style={styles.infoText}>
                칼로리(kcal): { consumedFood.calorie|| 'N/A'}
              </Text>
              <Text style={styles.infoText}>
                단백질(g): { consumedFood.protein|| 'N/A'}
              </Text>
              <Text style={styles.infoText}>
                지방(g): { consumedFood.fat|| 'N/A'}
              </Text>
              <Text style={styles.infoText}>
                탄수화물(g): { consumedFood.carbon_hydrate|| 'N/A'}
              </Text>
              <Text style={styles.infoText}>
                당류(g): { consumedFood.sugar|| 'N/A'}
              </Text>
              <Text style={styles.infoText}>
                나트륨(mg): { consumedFood.sodium|| 'N/A'}
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={"섭취한 음식의 양을 적어주세요"}
                value={inputWeight}
                onChangeText={(text) => setInputWeight(text)}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button} onPress={() => processNutritionData(Number(inputWeight))}>
                <Text style={styles.buttonText}>무게 설정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={sendFoodData}>
                <Text style={styles.buttonText}>{sendBtnText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
function getTodayKST() {
  const now = new Date();

  // UTC 시간으로 변환
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;

  // KST 시간으로 변환 (UTC+9)
  const koreaTime = new Date(utc + 9 * 60 * 60000);

  // YYYY-MM-DD 형식으로 반환
  const year = koreaTime.getFullYear();
  const month = String(koreaTime.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작
  const day = String(koreaTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
function getDayRangeOfMonth(dateString) {
  // 입력 형식을 분리 (예: "2024-12")
  const [year, month] = dateString.split('-').map(Number);

  // 다음 달의 첫 번째 날에서 하루를 빼서 해당 월의 마지막 날을 구함
  const lastDay = new Date(year, month, 0); // month는 1부터 시작하지 않음 (0: 이전 달의 마지막 날)
  const [str_year,str_month]=dateString.split('-')
  // YYYY-MM-DD 형식으로 반환
  const formattedDate = lastDay.toISOString().split('T')[0];
  return [dateString.slice(0, -3)+"-01",formattedDate];
}
function mk2SizeDateString(str){
  if(str.length==1){
    return "0"+str;
  }else{
    return str;
  }
}
function Page4({navigation,route}){
  const { randomKey,userid,email,setLogined } = route.params;
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [selectedDate, setSelectedDate] = useState(''); // State for selected date
  const [isChecked, setIsChecked] = useState(false);
  const [selectedDateText,setSelectedDateText]=useState("")
  const [dataJSON,setDataJSON]=useState({})
  const [colorJSON,setColorJSON]=useState({})
  const JSON_URL=BASE_URL+"exercise/manage/"
  const NO=0
  const YES=1;
  const NONE=2
  const dataUpdate = async (month)=>{
    let From;
    let To;
    if(typeof month=== "string"){
      [From,To]=getDayRangeOfMonth(month+"-01")
    }else{
      [From,To]=getDayRangeOfMonth(month.dateString)
    }
    const getData={
      "userid":userid,
      "from":From,
      "to":To
    }
    await axios.get(JSON_URL, {
      params: getData,
      headers: {"Random-Key":randomKey}
    }).then(res =>{
      if (res.status === 200) {
        const processedData={}
        for(var i=1;i<=Number(To.split("-")[2]);i++){
          const dateString=From.slice(0,-3)+"-"+mk2SizeDateString(String(i));
          if(res.data.data.length===0){
            processedData[dateString]=NONE;
          }else{
            for(var j=0;j<res.data.data.length;j++){
              const temp=res.data.data[j];
              if(temp.date===dateString){
                processedData[dateString]=temp.exercise?YES:NO;
                j = j < res.data.data.length - 1 ? j + 1 : j;
                break;
              }else{
                processedData[dateString]=NONE;
              }
            }
          }
        }
        setDataJSON(processedData)
      } else{
        Alert.alert("업데이트 필요")
      }
    }).catch(err =>{
      if(err.response){
        if (err.response.status === 401) {
          Alert.alert("다시 로그인 해주십시오")
          setLogined(false)
        } else if (err.response.status===400){
          Alert.alert("올바르지 않은 JSON")
        } else{
          Alert.alert(err.response.status.toString())
        }
      }else{
        Alert.alert("네트워크에 접속되지 않았습니다.")
      }
    })
  }
  useEffect(() => {
    dataUpdate(getTodayKST().slice(0, -3));
  },[]);
  useEffect(()=>{
    const temp={}
    for(var key in dataJSON){
      if(dataJSON[key]===NO){
        temp[key]={
          marked: true, dotColor: 'red'
        }
      }else if(dataJSON[key]===YES){
        temp[key]={
          marked: true, dotColor: 'blue'
        }
      }else{
        temp[key]={
          marked: true, dotColor: 'gray'
        }
      }
    }
    setColorJSON(temp);
  },[dataJSON])
  const onDayPress = (day) => {
    setSelectedDate(day.dateString); // Save the selected date
    if(dataJSON[day.dateString]===YES){
      setIsChecked(true);
      setSelectedDateText("수고하셨습니다!!")
    }else{
      setIsChecked(false);
      if(dataJSON[day.dateString]===NO){
        setSelectedDateText("계속 기록하는 당신, 대단합니다!!")
      }else{
        setSelectedDateText("기록되지 않았습니다.")
      }
    }
    setModalVisible(true); // Show the modal
  };
  const saveData = async()=>{
    if(dataJSON[selectedDate]===NONE||isChecked^dataJSON[selectedDate]===YES){
      const postData={
        "date":selectedDate,
        "exercise":isChecked,
        "userid":userid
      }
      await axios.post(JSON_URL,postData,{
        headers: { "Content-Type": "application/json","Random-Key":randomKey}
      }).then(res =>{
        if (res.status === 201) {
          const temp=Object.assign({}, dataJSON);
          temp[selectedDate]=isChecked?YES:NO;
          setDataJSON(temp)
          setModalVisible(false)
        } else{
          Alert.alert("업데이트 필요")
        }
      }).catch(err =>{
        if(err.response){
          if (err.response.status === 401) {
              Alert.alert("다시 로그인 해주십시오")
              setLogined(false)
            } else if (err.response.status===400){
              Alert.alert("올바르지 않은 JSON")
            } else{
              Alert.alert(err.response.status.toString())
            }
        }else{
          Alert.alert("네트워크에 접속되지 않았습니다.")
        }
      })
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>운동 캘린더</Text>
      <Calendar
        onDayPress={onDayPress} // 날짜 선택 시 호출
        onMonthChange={dataUpdate}
        markedDates={colorJSON}
      />

      {/* Modal for displaying selected date */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.exmodalOverlay}>
          <View style={styles.exmodalContent}>
            <Text style={styles.modalText}>{selectedDate}</Text>
            <Text style={styles.modalText}>{selectedDateText}</Text>
            <View style={styles.section}>
              <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setIsChecked} />
              <Text style={styles.modalText}>운동 여부</Text>
            </View>
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={saveData}
              >
                <Text style={styles.closeButtonText}>저장</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
function Page5({navigation,route}){
  const { randomKey,userid,email,setLogined } = route.params;
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const [selectedDate, setSelectedDate] = useState(''); // State for selected date
  const [isChecked, setIsChecked] = useState(false);
  const [dataJSON,setDataJSON]=useState({})
  const [colorJSON,setColorJSON]=useState({})
  const [reportJSON,setReportJSON]=useState({})
  const [selectedDateText,setSelectedDateText]=useState("")
  const [selectedNums,setSelectedNums]=useState([])


  const JSON_URL=BASE_URL+"food/manage/"
  const BAD=0
  const NORMAL=1;
  const GOOD=2
  const INCOMPLETE=3;
  const NONE=4
  const is_complete=(state)=>{return state==BAD||state==NORMAL||state==GOOD}
  const evaluateRecord=(sample)=>{
    if(sample){
      if(sample.food_complete){
        //한국인 영양소 섭취기준(KDRIs) -> 2020 한국인 영양소 섭취기준 활용 by (사)한국영양학회
        // 탄수화물 55~65%, 단백질 7~20% 지방 15~30% 
        // (성별에 따라 차이가 나지만) (다이어트도 고려해)대부분 연령대 고려시 최소 열량 1500Kcal, 최대 열량 2600Kcal
        // 당류 10~20%, 정제 당류 10% 미만
        // 외부 자료 -> 소금 최소 600mg, 최대 2000mg 

        const proteinRatio=sample.total_protein*4/sample.total_calorie
        const carbon_hydrateRatio=sample.total_carbon_hydrate*4/sample.total_calorie;
        const fatRatio=sample.total_fat*9/sample.total_calorie;
        const sugarRatio=sample.total_sugar*4/sample.total_calorie;
        
        const calorieBAD=sample.total_calorie<1500||sample.total_calorie>2600;
        const proteinGOOD=0.07<=proteinRatio&&proteinRatio<=0.2
        const proteinBAD=proteinRatio<0.07
        const carbon_hydrateGOOD=0.55<=carbon_hydrateRatio&&carbon_hydrateRatio<=0.65
        const carbon_hydrateBAD=carbon_hydrateRatio>0.65
        const fatGOOD=0.15<=fatRatio&&fatRatio<=0.3
        const fatBAD=fatRatio>0.3
        const sodiumGOOD=sample.total_sodium<=2000
        const sodiumBAD=sample.total_sodium<600
        const sugarBAD=sugarRatio>0.2

        const proteinPercent=(proteinRatio*100).toFixed(2)
        const carbon_hydratePercent=(carbon_hydrateRatio*100).toFixed(2)
        const fatPercent=(fatRatio*100).toFixed(2)
        const sugarPercent=(sugarRatio*100).toFixed(2)

        let calState
        let proteinState
        let carbon_hydrateState
        let fatState
        let sodiumState
        let sugarState
        if(calorieBAD){
          calState="너무 많거나 적은 섭취량"
        }else{
          calState="적정량"
        }
        if(proteinBAD){
          proteinState="너무 적은 비율"
        }else if(proteinGOOD){
          proteinState="적정 비율"
        }else{
          proteinState="비율이 높음"
        }
        if(carbon_hydrateBAD){
          carbon_hydrateState="너무 높은 비율"
        }else if(carbon_hydrateGOOD){
          carbon_hydrateState="적정 비율"
        }else{
          carbon_hydrateState="비율이 낮음"
        }
        if(fatBAD){
          fatState="너무 높은 비율"
        }else if(fatGOOD){
          fatState="적정 비율"
        }else{
          fatState="비율이 낮음"
        }
        if(sodiumBAD){
          sodiumState="너무 적은 섭취량"
        }else if(sodiumGOOD){
          sodiumState="적정량"
        }else{
          sodiumState="섭취량이 높음"
        }
        if(sugarBAD){
          sugarState="너무 높은 비율"
        }else{
          sugarState="적정 비율"
        }
        const report="전체 열량(적정: 1500~2600kCal)"+"\n->"+calState+`(${sample.total_calorie}kCal)`+"\n"
        +"단백질 섭취 비율(적정: 7~20%)"+"\n->"+proteinState+`(${proteinPercent}%)`+"\n"
        +"탄수화물 섭취 비율(적정: 55~65%)"+"\n->"+carbon_hydrateState+`(${carbon_hydratePercent}%)`+"\n"
        +"지방 섭취 비율(적정: 15~30%)"+"\n->"+fatState+`(${fatPercent}%)`+"\n"
        +"나트륨 섭취량(적정: 600~2000mg)"+"\n->"+sodiumState+`(${sample.total_sodium}mg)`+"\n"
        +"당류 섭취 비율(적정: 10~20%, 정제 당류 10% 미만)"+"\n->"+sugarState+`(${sugarPercent}%)`+"\n"
        if(calorieBAD||proteinBAD||carbon_hydrateBAD||fatBAD||sodiumBAD||sugarBAD){
          return [BAD,report]
        }else if(proteinGOOD&&carbon_hydrateGOOD&&fatGOOD&&sodiumGOOD){
          return [GOOD,report];
        }else{
          return [NORMAL,report];
        }
      }else{
        return [INCOMPLETE,""]
      }
    }else{
      return [NONE,""]
    }
  }
  const dataUpdate = async (month)=>{
    let From;
    let To;
    if(typeof month=== "string"){
      [From,To]=getDayRangeOfMonth(month+"-01")
    }else{
      [From,To]=getDayRangeOfMonth(month.dateString)
    }
    const getData={
      "userid":userid,
      "from":From,
      "to":To
    }
    await axios.get(JSON_URL, {
      params: getData,
      headers: {"Random-Key":randomKey}
    }).then(res =>{
      if (res.status === 200) {
        const processedData={}
        for(var i=1;i<=Number(To.split("-")[2]);i++){
          const dateString=From.slice(0,-3)+"-"+mk2SizeDateString(String(i));
          if(res.data.data.length===0){
            processedData[dateString]=NONE;
          }else{
            for(var j=0;j<res.data.data.length;j++){
              const temp=res.data.data[j];
              if(temp.date===dateString){
                processedData[dateString]={
                  "total_calorie":temp["total_calorie"],
                  "total_protein":temp["total_protein"],
                  "total_fat":temp["total_fat"],
                  "total_carbon_hydrate":temp["total_carbon_hydrate"],
                  "total_sugar":temp["total_sugar"],
                  "total_sodium":temp["total_sodium"],
                  "consumed_foods":temp["consumed_foods"],
                  "food_complete":temp["food_complete"],
                };
                j = j < res.data.data.length - 1 ? j + 1 : j;
                break;
              }else{
                processedData[dateString]=false;
              }
            }
            
          }
        }
        setDataJSON(processedData)
      } else{
        Alert.alert("업데이트 필요")
      }
    }).catch(err =>{
      if(err.response){
        if (err.response.status === 401) {
          Alert.alert("다시 로그인 해주십시오")
          setLogined(false)
        } else if (err.response.status===400){
          Alert.alert("올바르지 않은 JSON")
        } else{
          Alert.alert(err.response.status.toString())
        }
      }else{
        Alert.alert("네트워크에 접속되지 않았습니다.")
      }
    })
  }
  useEffect(() => {
    dataUpdate(getTodayKST().slice(0, -3));
  },[]);
  useEffect(()=>{
    const report={}
    var key;
    for(key in dataJSON){
      report[key]=evaluateRecord(dataJSON[key])
    }
    setReportJSON(report);
    const temp={}
    for(key in dataJSON){
      if(report[key][0]===BAD){
        temp[key]={
          marked: true, dotColor: 'red'
        }
      }else if(report[key][0]===NORMAL){
        temp[key]={
          marked: true, dotColor: 'green'
        }
      }else if(report[key][0]===GOOD){
        temp[key]={
          marked: true, dotColor: 'blue'
        }
      }else if(report[key][0]===INCOMPLETE){
        temp[key]={
          marked: true, dotColor: 'purple'
        }
      }else{
        temp[key]={
          marked: true, dotColor: 'gray'
        }
      }
    }
    setColorJSON(temp);
  },[dataJSON])
  const onDayPress = (day) => {
    setSelectedNums([])
    setSelectedDate(day.dateString); // Save the selected date
    if(is_complete(reportJSON[day.dateString][0])){
      setIsChecked(true);
    }else{
      setIsChecked(false);
    }
    const evaluation=reportJSON[day.dateString][1]
    if(evaluation){
      setSelectedDateText(evaluation)
    }else{
      setSelectedDateText("식단 표가 확정되지 않아 리포트가 제공되지 않습니다.")
    }
    setModalVisible(true); // Show the modal
  };
  const saveData = async()=>{
    if(!(is_complete(reportJSON[selectedDate][0]))||isChecked^is_complete(reportJSON[selectedDate][0])){
      const putData={
        "date":selectedDate,
        "food_complete":isChecked,
        "userid":userid
      }
      await axios.put(JSON_URL,putData,{
        headers: { "Content-Type": "application/json","Random-Key":randomKey}
      }).then(res =>{
        if (res.status === 200) {
          const temp=Object.assign({}, dataJSON);
          temp[selectedDate].food_complete=isChecked;
          setDataJSON(temp)
          setModalVisible(false)
        } else{
          Alert.alert("업데이트 필요")
        }
      }).catch(err =>{
        if(err.response){
          if (err.response.status === 401) {
              Alert.alert("다시 로그인 해주십시오")
              setLogined(false)
            } else if (err.response.status===400){
              Alert.alert("올바르지 않은 JSON")
            } else if (err.response.status===404){
              Alert.alert("데이터가 존재하지 않습니다. 음식을 등록해 주세요.")
            }else{
              Alert.alert(err.response.status.toString())
            }
        }else{
          Alert.alert("네트워크에 접속되지 않았습니다.")
        }
      })
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.header}>식단 캘린더</Text>
      <Calendar
        onDayPress={onDayPress} // 날짜 선택 시 호출
        onMonthChange={dataUpdate}
        markedDates={colorJSON}
      />

      {/* Modal for displaying selected date */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaProvider>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.modalContent}>
                  {/* 컨텐츠 삽입 */}
                  <Text style={styles.modalText}>{selectedDate + "-식단 보고서+=+="}</Text>
                  <Text style={styles.modalText}>
                    {selectedDateText}
                  </Text>
                  <Text style={styles.modalText}>{"섭취한 식품들\n-> 삭제할 요소를 선택 후 저장 및 삭제 버튼을 눌러주세요 -> 시간 이슈"}</Text>
                  <Text style={styles.modalText}>{dataJSON[selectedDate]?JSON.stringify(dataJSON[selectedDate].consumed_foods):"저장되거나 확정되지 않음"}</Text>
                </View>
              </ScrollView>
              <View style={styles.section}>
                <Checkbox
                  style={styles.checkbox}
                  value={isChecked}
                  onValueChange={setIsChecked}
                />
                <Text style={styles.modalText}>식단 확정 여부</Text>
              </View>
              <View style={styles.section}>   
                <TouchableOpacity style={styles.modalButton} onPress={saveData}>
                  <Text style={styles.closeButtonText}>저장 및 삭제</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>닫기</Text>
                </TouchableOpacity>
              </View>    
            </View>
          </View>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}
function Page6({navigation,route}){
  const { randomKey,userid,email,setLogined } = route.params;
  const [modalVisible,setModalVisible]=useState(false)
  const [password,setPassword]=useState("")
  const [alertText,setAlertText]=useState("비밀번호를 입력해 회원 탈퇴를 진행해 주십시오.")
  const JSON_URL=BASE_URL+"account/manage/"
  const postData={
    "PWD":password,
    "email":email,
    "is_usingID":false
  }
  const logout=()=>{
    setLogined(false)
  }
  const cancelAccount=async()=>{
    if(password.length===0){
      Alert.alert("비밀번호를 입력해주세요.")
      return
    }
    await axios.delete(JSON_URL, {
        data: postData, // 데이터를 config 객체의 data 속성에 포함
        headers: {
          "Content-Type": "application/json",
          "Random-Key": randomKey,
        },
      }).then(res =>{
        if (res.status === 204) {
          Alert.alert("계정 삭제 성공!!")
          setLogined(false)
        } else if(res.status===203){
          Alert.alert("비밀번호가 틀립니다.")
          setPassword("")
        }else{
          Alert.alert("업데이트 필요")
        }
      }).catch(err =>{
        if(err.response){
          if (err.response.status === 401) {
              Alert.alert("다시 로그인 해주십시오")
              setLogined(false)
            } else if (err.response.status===400){
              Alert.alert("올바르지 않은 JSON")
            } else if (err.response.status===404){
              Alert.alert("계정이 존재하지 않습니다.")
              setLogined(false)
            }else if (err.reponse.status===405){
              
            }else{
              Alert.alert(err.response.status.toString())
            }
        }else{
          Alert.alert("네트워크에 접속되지 않았습니다.")
        }
      })
  }
  return(
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.exmodalOverlay}>
          <View style={styles.exmodalContent}>
            <Text>{alertText}</Text>
            <TextInput
              style={styles.logininputContainer}
              placeholder=" 비밀번호 입력"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={cancelAccount}
              >
                <Text style={styles.closeButtonText}>확인</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={logout}
      >
        <Text style={styles.closeButtonText}>로그아웃</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.modalButton}
        onPress={()=>{setModalVisible(true)}}
      >
        <Text style={styles.closeButtonText}>회원탈퇴</Text>
      </TouchableOpacity>
    </View>
  )
}
function CustomDrawerContent(props) {
  return(
    <DrawerContentScrollView {...props} style={{backgroundColor:"seagreen"}}>
      <DrawerItemList {...props}/>
      <DrawerItem label="Copyright" onPress={() => alert("Copyright 2024. PKNU all right reserved.")} />
    </DrawerContentScrollView>
  );
}
const Drawer= createDrawerNavigator();

const App = () => {
  const [logined,setLogined]=useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [randomKey,setRandomKey] = useState('');
  const [userid,setUserID]=useState('');
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const handleLogin = async() => {
    if (!emailRegex.test(email)){
      Alert.alert("올바르지 않은 이메일 형식입니다.")
      return
    }
    const JSON_URL=BASE_URL+"account/login/"
    const postData={
      "PWD":password,
      "email":email,
      "is_usingID":false
    }
    await axios.post(JSON_URL, postData,{
      headers: { "Content-Type": "application/json"}
    }).then(res =>{
      if (res.status === 200) {
        setUserID(res.data.userid)
        setRandomKey(res.data.random_key)
        setEmail(res.data.email)
        setLogined(true)
      } else{
        Alert.alert("업데이트 필요")
      }
    }).catch(err =>{
      if(err.response){
        if (err.response.status === 401) {
            Alert.alert("아이디나 비밀번호가 틀립니다.")
          } else if (err.response.status===400){
            Alert.alert("올바르지 않은 JSON")
          } else{
            Alert.alert(err.response.status.toString())
          }
      }else{
        Alert.alert("네트워크에 접속되지 않았습니다.")
      }
    })
  };
  const handleSignUp= async ()=>{
    if (!emailRegex.test(email)){
      Alert.alert("올바르지 않은 이메일 형식입니다.")
      return
    }
    if(password.length<4){
      Alert.alert("비밀번호가 너무 짧습니다.")
      return
    }
    const JSON_URL=BASE_URL+'account/manage/'
    const postData={
      "userid":email,
      "PWD":password,
      "email":email,
      "name":email
    }
    let is_possible=false;
    await axios.get(JSON_URL, { params: { userid: email } })
    .then(res => {
      if (res.status === 200) {
        Alert.alert("이미 존재하는 이메일입니다.")
        setEmail("")
      }else if(res.status===204){
        is_possible=true;
      }
    })
    .catch(err => {// message name code config request
      if(err.response){
        if (err.response.status === 400) {
          Alert.alert("올바르지 않은 JSON")
        } else {
          Alert.alert(err.response.status.toString())
        }
      } else{
        Alert.alert("네트워크에 접속되지 않았습니다.")
        // Alert.alert(err.request._response)
      }
    });
    if(is_possible){
      await axios.post(JSON_URL, postData,{
        headers: { "Content-Type": "application/json"}
      })
      .then(res => {
        if (res.status === 201) {
          Alert.alert("계정 생성 성공!!")
        } else{
          Alert.alert("업데이트 필요")
        }
      })
      .catch(err => {
        if(err.response){
          if (err.response.status === 400) {
            Alert.alert("올바르지 않은 JSON")
          } else if (err.response.status===403){
            Alert.alert("동일한 이메일이 존재합니다.")
          } else{
            Alert.alert(err.response.status.toString())
          }
        } else{
          Alert.alert("네트워크에 접속되지 않았습니다.")
          // Alert.alert(err.request._response)
        }
      })
    }
    
  }
  if(logined){
    return (
        <SafeAreaProvider>
          <WeatherProvider>
            <NavigationContainer>
              <Drawer.Navigator initialRouteName={P1} drawerContent={(props) => <CustomDrawerContent {...props} />}>
                <Drawer.Screen name={P1} component={Page1} initialParams={{ randomKey,userid,email }}/>
                <Drawer.Screen name={P2} component={Page2} initialParams={{ randomKey,userid,email }}/>
                <Drawer.Screen name={P3} component={Page3} initialParams={{ randomKey,userid,email,setLogined }}/>
                <Drawer.Screen name={P4} component={Page4} initialParams={{ randomKey,userid,email,setLogined }}/>
                <Drawer.Screen name={P5} component={Page5} initialParams={{ randomKey,userid,email,setLogined }}/>
                <Drawer.Screen name={P6} component={Page6} initialParams={{ randomKey,userid,email,setLogined }}/>
              </Drawer.Navigator>
            </NavigationContainer>
          </WeatherProvider>
        </SafeAreaProvider>
    );
  }else {
    return(
      <SafeAreaProvider>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <SafeAreaView style={styles.safearea}>
            <View style={styles.logincontainer}>
              <View style={styles.titleImgcontainer}>
                <Image source ={require('./assets/snack-icon.png')} style={{height:250, width:250,}} resizeMode="center"/>
              </View>
              <View>
                <Text style={styles.logintitle}>E-mail</Text>
                <TextInput
                  style={styles.logininputContainer}
                  placeholder=" 이메일 입력"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Text style={styles.logintitle}>Password</Text>
                <TextInput
                  style={styles.logininputContainer}
                  placeholder=" 비밀번호 입력"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} > 
                  <Text style={styles.loginButtonText}> Login </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.loginButton} onPress={handleSignUp} > 
                  <Text style={styles.loginButtonText}> SignUp </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </SafeAreaProvider>
    )
  }
};
const styles = StyleSheet.create({
  recommandImage: {
    resizeMode: 'contain',
    height: 300,
    width: 400,
    alignContent:"center"
  },
  safearea: {
    flex: 1,
  },
  webview:{
    flex:1
  },
  discomfort_index:{
    fontSize:20,
    fontStyle:"bold",
    color: "#171944",
    alignContent:"center",
    textAlign:"center"
  },
  recommandText:{
    fontSize:18,
    fontStyle:"bold",
    alignContent:"center",
    textAlign:"center"
  },
  alertText:{
    fontSize:18,
    fontStyle:"bold",
    color:"red",
    alignContent:"center",
    textAlign:"center"
  },
  searchbutton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#b8c0ff',  // 기본 버튼 색상
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  searchbuttonLoading: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fb6f92',  // 로딩 중 버튼 색상
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  // 디자인은 gpt의 도움을 받음
  button: {
    height: 40,
    backgroundColor: '#caffbf',  // 버튼 배경색
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,  // 둥근 모서리
    width: 100,  // 버튼의 너비
    marginLeft: 'auto',  // 버튼을 우측 끝에 고정
    shadowColor: '#000',  // 버튼 그림자 효과
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,  // 안드로이드에서 그림자 효과 적용
  },
  item: {
    flexDirection: 'row',  // 자식 요소들을 가로로 배치
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',  // 항목 간 구분선 색상
    marginHorizontal: 15,  // 왼쪽, 오른쪽 간격
    marginVertical: 5,  // 위 아래 간격
    backgroundColor: '#fff',  // 항목 배경색
    borderRadius: 8,  // 둥근 모서리
    shadowColor: '#000',  // 그림자 효과
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center',  // 자식 요소들을 수직 중앙에 배치
    justifyContent: 'space-between',  // 요소들을 좌우로 분배
    padding:10
  },
  infoContainer: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android shadow
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9e000', //code for kakaotalk yellow 
    paddingHorizontal: 20,
  },
  titleImgcontainer:{
     alignItems:'center', padding: 30
  },
  logintitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 5,
  },
  logininputContainer: {
    height: 50, 
    borderColor: 'gray', 
    borderWidth: 2, 
    marginBottom: 10,
    backgroundColor: 'white', 
  },
  loginButton: {
    backgroundColor: '#3662AA',
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    margin:5
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    margin: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  modalContainer: {
    width: '90%', // 화면 너비의 90%
    height: '90%', // 화면 높이의 90%
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden', // 내용이 모달 바깥으로 넘치지 않도록 설정
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  // section: {
  //   marginVertical: 10,
  // },
  exmodalOverlay: {
    flex: 1, // 화면 전체를 차지
    justifyContent: 'center', // 세로 중앙 정렬
    alignItems: 'center', // 가로 중앙 정렬
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
  },
  exmodalContent: {
    width: '80%', // 화면 너비의 80% 사용
    padding: 20, // 내부 여백
    backgroundColor: 'white', // 흰색 배경
    borderRadius: 10, // 모서리 둥글게
    shadowColor: '#000', // 그림자 색상
    shadowOffset: { width: 0, height: 2 }, // 그림자 위치
    shadowOpacity: 0.25, // 그림자 투명도
    shadowRadius: 4, // 그림자 퍼짐 정도
    elevation: 5, // 안드로이드 그림자 효과
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  tableheader: {
    backgroundColor: '#f1f1f1',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },

});
export default App;
