import React, { createContext, useState, useContext } from 'react';
import apiService from '@/servicesApi/apiService';

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

      setRatingDetails(response.data.data);
    } catch (error) {
      console.error('Error fetching survey rating details:', error);
      setRatingDetails([]);
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
        setStatusLoading

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
