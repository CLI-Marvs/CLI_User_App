import React, { createContext, useState, useContext } from 'react';
import apiService from '../../component/servicesApi/apiService';

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [survey_title, setSurveyTitle] = useState("");
  const [survey_loading, setLoading] = useState(false);
  const [ratingDetails, setRatingDetails] = useState([]);

  const fetchSurveyTitle = async (survey_list_id) => {
    setLoading(true);
    try {
      const response = await apiService.get(`/survey-title/${survey_list_id}`);
      const title = response.data?.survey_title ?? response.data ?? "";
      setSurveyTitle(title);
    } catch (error) {
      console.error('Error fetching survey title:', error);
      setSurveyTitle("");
    } finally {
      setLoading(false);
    }
  };

  const fetchSurveyRatingDetails = async (survey_list_id) => {
    try {
      const response = await apiService.get(`/survey-rating-details/${survey_list_id}`);
      
      setRatingDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching survey rating details:', error);
      setRatingDetails([]);
    } 
  };

  return (
    <SurveyContext.Provider value={{ survey_title, fetchSurveyTitle, survey_loading, ratingDetails, fetchSurveyRatingDetails }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};
