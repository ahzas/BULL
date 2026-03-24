// src/context/JobContext.js
import { createContext, useState } from 'react';

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  // Başlangıç verileri (Boş olmasın diye senin Sarp Gıda ilanını ekledim)
  const [jobs, setJobs] = useState([
    { 
      id: '1', 
      title: 'Günlük Garson', 
      company: 'Sarp Gıda Ltd.', 
      price: '1.500 TL', 
      location: 'Beşiktaş', 
      rating: 4.8, 
      image: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
      type: 'job' 
    }
  ]);

  const addJob = (newJob) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
  };

  return (
    <JobContext.Provider value={{ jobs, addJob, setJobs }}>
      {children}
    </JobContext.Provider>
  );
};