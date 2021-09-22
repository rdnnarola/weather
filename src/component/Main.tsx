import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { API_KEY, CITIES } from '../const.js';
import Error from './Error';

interface cityInterface {
  id: number;
  name: string;
}
interface weatherInterface {
  icon: string;
  main: MainInterface;
}

interface MaxProbabilityInterface {
  date: string;
  value: number;
}
interface MainInterface {
  temp: number;
}

const Main = () => {
  const [data, setData] = useState<any>([]);
  const [city, setCity] = useState<string>('524901');
  const [error, setError] = useState<string>('');
  const [maxRainDay, setMaxRainDay] = useState<MaxProbabilityInterface>({
    date: '',
    value: 0,
  });
  const [maxSnowDay, setMaxSnowDay] = useState<MaxProbabilityInterface>({
    date: '',
    value: 0,
  });

  // api call and handle data
  const getWeatherForecast = () => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/forecast?id=${city}&appid=${API_KEY}`
      )
      .then((res) => {
        let maxRain = { date: '', value: 0.0 }; // object to find out max rain probability
        let maxSnow = { date: '', value: 0.0 }; // object to find out max snow probability
        const temp: any = {}; // object to manage the data
        let rainFrequency = 0; // count the rain frequency

        res.data.list.forEach((oneDayData: any) => {
          // covert UTC date
          const date = moment(oneDayData.dt_txt).format('DD-MM-YYYY');

          // if weather condition is same on all 5 days
          if (oneDayData.rain) {
            rainFrequency += 1;
            setTimeout(() => {
              if (rainFrequency >= 25) {
                maxRain = {
                  date: moment(res.data.list[0].dt_txt).format('DD-MM-YYYY'),
                  value: 35,
                };
                setMaxRainDay(maxRain);
              }
            }, 100);
          }

          if (typeof temp[date] === 'undefined') {
            // condition to retrieve max snow throught the week
            if (
              oneDayData.snow && maxSnow.value <= Math.round(oneDayData.snow['3h'])
            ) {
              maxSnow = { date, value: oneDayData.snow['3h'] };
            }

            temp[date] = {
              date,
              time: [oneDayData.dt_txt],
              rainStatus: [
                oneDayData.weather[0].main === 'Rain' ? 'true' : 'false',
              ],
              main: [oneDayData.main],
              weather: oneDayData.weather,
            };
          } else {
            temp[date].weather = temp[date].weather.concat(oneDayData.weather);
            temp[date].main.push(oneDayData.main);
            temp[date].time.push(oneDayData.dt_txt);
            temp[date].rainStatus.push(
              oneDayData.weather[0].main === 'Rain' ? 'true' : 'false'
            );
          }
        });

        setMaxRainDay(maxRain);
        setMaxSnowDay(maxSnow);
        setData(temp);
      })
      .catch(() => setError('Something went wrong, please try after sometime'));
  };

  // this method uses to bring citywise data
  useEffect(() => {
    getWeatherForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  // this method uses to retrieve the params on page refresh and set last visited page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityName = params.get('city');
    const selecetdCity: any = CITIES.find(
      (o: cityInterface) => o.name === cityName
    );
    if (selecetdCity) setCity(selecetdCity.id);
  }, []);

  // this method uses to set the params onchange
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCity(e.target.value);
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const selecetdCity = CITIES.find(
      // eslint-disable-next-line radix
      (o: cityInterface) => o.id === parseInt(e.target.value)
    );

    // this method uses to set the params on page refresh and set last visited page
    if (selecetdCity !== undefined) {
      params.set('city', selecetdCity.name);
      window.history.pushState(
        '',
        '',
        `${window.location.origin}?${params.toString()}`
      );
    }
  };

  // convert kelvin temperature to celcius
  const getCelcius = (temp: number) => `${(temp - 273.15).toFixed(2)}°C`;

  return (
    <div>
      <h1>Weather Forecast Data</h1>

      <div>
        <select onChange={(e) => handleChange(e)} value={city}>
          {CITIES.map((cities: cityInterface) => (
            <option key={cities.id} value={cities.id}>{cities.name}</option>
          ))}
        </select>
      </div>

      <hr />
      <Error error={error} />
      {!error && (
        <section>
          {Object.keys(data).length > 0 && Object.keys(data).map((day: string) => (
            <div key={day} className="container">
              <div className="single-day row align-items-center bold">
                <div className="col-2">
                  <div className="date">{day}</div>
                  {day === maxRainDay.date && (
                  <div className="date text-success">
                    Best Selling day for an Umbrella
                  </div>
                  )}
                  {day === maxSnowDay.date && (
                  <div className="date text-success">
                    Best Selling day for a jacket
                  </div>
                  )}
                </div>
                <div className="col-10">
                  <div className="cloudWeatherWrapper">
                    {data[day].weather.map(
                      (weather: weatherInterface, index: number) => (
                        <div key={data[day].time[index]} className="time">
                          <div>
                            <img
                              // eslint-disable-next-line prefer-template
                              src={'http://openweathermap.org/img/w/' + weather.icon + '.png'}
                              alt="weather-icon"
                            />
                          </div>
                          <div>
                            {moment(data[day].time[index]).format('h a')}
                          </div>
                          <div>{weather.main}</div>
                          <div className="bold">
                            {getCelcius(data[day].main[index].temp)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Main;
