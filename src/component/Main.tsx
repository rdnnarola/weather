import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { API_KEY, CITIES } from "../const";
import Error from "./Error";

interface cityInterface {
    id:number,
    name:string,
}
interface weatherInterface {
    icon:string,
    main: MainInterface,
}
interface MainInterface {
    temp:number
}

const Main = () => {

  const [data, setData] = useState<any>([]);
  const [city, setCity] = useState<string>("524901");
  const [error, setError] = useState<string>("");
  const [maxRainDay, setMaxRainDay] = useState<any>({ date: "", value: 0 });
  const [maxSnowDay, setMaxSnowDay] = useState<any>({ date: "", value: 0 });
  const getWeatherForecast = () => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/forecast?id=${city}&appid=${API_KEY}`
      )
      .then((res) => {
        let maxRain = { date: "", value: 0.0 };
        let maxSnow = { date: "", value: 0.0 };
        let temp: any = {};

        res.data.list.forEach((oneDayData: any) => {
          let date = moment(oneDayData.dt_txt).format("DD-MM-YYYY");

          console.log('oneDayData.snow =>',oneDayData);
          if (typeof temp[date] === "undefined") {
            if (oneDayData.rain) {
              if (maxRain.value <= oneDayData.rain["3h"]) {
                maxRain = {
                  date,
                  value: oneDayData.rain["3h"],
                };
                
              }
            }
            if (oneDayData.snow) {
              if (maxSnow.value <= Math.round(oneDayData.snow["3h"])) {
                maxSnow = {
                  date,
                  value: oneDayData.snow["3h"],
                };
                console.log('maxSnow =>',maxSnow);
              }
            }
            temp[date] = {
              date,
              time:[oneDayData.dt_txt],
              main: [oneDayData.main],
              weather: oneDayData.weather,
            };
          } else {
            temp[date].weather = temp[date].weather.concat(oneDayData.weather);
            temp[date].main.push(oneDayData.main);
            temp[date].time.push(oneDayData.dt_txt);
          }
        });
console.log('maxSnow =>',maxSnow);
        setMaxRainDay(maxRain);
        setMaxSnowDay(maxSnow);
        setData(temp);
      })
      .catch((err) => setError("Something went wrong, please try after sometime"));
  };

  useEffect(() => {
    getWeatherForecast();
  }, [city]);

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    let cityName= params.get("city")
    let selecetdCity:any = CITIES.find((o:cityInterface)=>o.name===cityName)
        selecetdCity && setCity(selecetdCity.id)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
    let params:URLSearchParams = new URLSearchParams(window.location.search);
    let selecetdCity = CITIES.find((o:cityInterface)=>o.id===parseInt(e.target.value))
    
    if(selecetdCity !== undefined){    
    params.set('city', selecetdCity.name);
    window.history.pushState('', "", `${window.location.origin}?${params.toString()}`);
    }
  };

  const getCelcius = (data: number) => {
    return `${(data - 273.15).toFixed(2)}°C`;
  };

  console.log('data =>',data);
  return (
    <div>
      <h1>Weather Forecast Data</h1>

      <div>
        <select onChange={(e) => handleChange(e)} value={city}>
          {CITIES.map((city: cityInterface) => (
            <option value={city.id}>{city.name}</option>
          ))}
        </select>
      </div>

      <hr />
      <Error error={error} />
     {!error&& <section>
        {Object.keys(data).length > 0 &&
          Object.keys(data).map((day:string) => (
            <div className="container">
              <div className="single-day row align-items-center bold">
                <div className="col-2">
                  <div className="date">{day}</div>
                  {day === maxRainDay.date && (
                    <div className="date text-success">
                      Best Selling day for an Umbrella
                    </div>
                  )}
                  {day === maxSnowDay.date && 
                    <div className="date text-success">
                      Best Selling day for a jacket
                    </div>
                  }
                </div>
                <div className="col-10">
                  <div className="cloudWeatherWrapper">
                    {data[day].weather.map((weather: weatherInterface, index: number) => (
                      <div className="time">
                        <div>
                          <img src={ "http://openweathermap.org/img/w/" + weather.icon + ".png" } alt="weather-icon" />
                        </div>
                        <div> {moment(data[day].time[index]).format("h a")} </div>
                        <div>{weather.main}</div>
                        <div className="bold"> {getCelcius(data[day].main[index].temp)} </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </section>
    }
    </div>
  );
};

export default Main;
