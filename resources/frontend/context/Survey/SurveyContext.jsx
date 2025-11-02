import React, { createContext, useState, useContext } from 'react';
import apiService from '../../component/servicesApi/apiService';

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [survey_title, setSurveyTitle] = useState("");
  const [survey_loading, setLoading] = useState(false);
  const [ratingDetails, setRatingDetails] = useState([]);
  const [surveyLinks, setSurveyLinks] = useState([]);
  const [surveyStatus, setSurveyStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);


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
      const responseData = response.data;
      return responseData;
    } catch (error) {
      console.error('Error fetching survey rating details:', error);
    }
  };

  const fetchSurveyLinks = async () => {
    try {
      const response = await apiService.get('/survey-links');
      setSurveyLinks(response.data);
    } catch (err) {
      setError('Failed to fetch survey links');
      console.error(err);
    }
  };

  const fetchSurveyStatus = async (ticketId) => {

    const newTicketId = ticketId.replace("Ticket#", "").trim();

    try {
      const response = await apiService.get(`/survey-status/${newTicketId}`);
      setSurveyStatus(response.data.status);
      setStatusLoading(false);
    } catch (error) {
      console.error('Error fetching survey status:', error);
    }
  };


  const fetchRespondentsCount = async (survey_list_id) => {
    try {
      const response = await apiService.get(`/total-responses/${survey_list_id}`);
      const totalRespondents = response.data;
      return totalRespondents;
    } catch (error) {
      console.error('Error fetching total respondents:', error);
    }
  };


  const fetchMonthlyResponseChange = async (survey_list_id) => {
    try {
      const response = await apiService.get(`/monthly-response-change/${survey_list_id}`);
      const monthlyResponseChange = response.data;
      return monthlyResponseChange;
    } catch (error) {
      console.error('Error fetching monthly response change:', error);
    }
  };

  const fetchSurveysRatings = async (survey_list_id) => {
    try {
      const response = await apiService.get(`/average-rating/${survey_list_id}`);
      const surveysRatings = response.data;
      return surveysRatings;
    } catch (error) {
      console.error('Error fetching surveys ratings', error);
    }
  };

  const fetchHighLowCount = async (survey_list_id) => {
    try {
      const response = await apiService.get(`/highest-low-count/${survey_list_id}`);
      const highestLowCount = response.data;
      return highestLowCount;
    } catch (error) {
      console.error('Error fetching highest and lowest count', error);
    }
  };

  const fetchSurveyResponses = async (survey_list_id, filter = null) => {
    try {
      let endpoint = `/survey-responses/${survey_list_id}`;

      if (filter && filter.startDate && filter.endDate) {
        endpoint += `?startDate=${filter.startDate}&endDate=${filter.endDate}&filterType=${filter.filterType}`;
      }

      const response = await apiService.get(endpoint);
      const responses = response.data;
      return responses;
    } catch (error) {
      console.error('Error fetching survey responses', error);
    }
  };


  return (
    <SurveyContext.Provider value={
      {
        survey_title,
        fetchSurveyTitle,
        survey_loading,
        ratingDetails,
        fetchSurveyRatingDetails,
        fetchSurveyLinks,
        surveyLinks,
        fetchSurveyStatus,
        surveyStatus,
        statusLoading,
        setStatusLoading,
        fetchRespondentsCount,
        fetchMonthlyResponseChange,
        fetchSurveysRatings,
        fetchHighLowCount,
        fetchSurveyResponses,
      }
    }>
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
