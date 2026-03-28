const mongoose = require('mongoose');
const Job = require('./bull-backend/models/Job.js');

const data = {
  title: 'cart curt falan filan',
  company: '',
  price: '5000',
  location: '',
  description: 'beuha',  
  category: 'Lojistik ve Taşımacılık',
  subCategory: 'Şoför',  
  serviceType: 'Bull-Tır',
  fromCity: 'Çorum',     
  fromDistrict: 'Laçin', 
  fromAddressDetail: 'su',
  toCity: 'Adana',       
  toDistrict: 'Ceyhan',  
  toAddressDetail: 'fabrika',
  tonnage: '1',
  productType: 'Paletli Yük',
  vehicleType: 'Tenteli',
  loadingDate: '01.05.2026',
  contractApproved: true,
  fromLocation: 'Çorum - Laçin - su',
  toLocation: 'Adana - Ceyhan - fabrika',
  latitude: 41.112088777004644,
  longitude: 28.80824514674505,
  image: 'truck-outline',
  rating: 5,
  ownerRole: 'employer', 
  ownerId: '69c854f674b9fe970f9b1590',
  type: 'job_offer'      
};

const newJob = new Job({
  title: data.title,
  company: data.company, // "company" is req.body.company
  image: data.image,
  category: data.category,
  subCategory: data.subCategory,
  serviceType: data.serviceType || "Bull-Part",
  price: data.price,
  location: data.location,
  fromLocation: data.fromLocation,
  toLocation: data.toLocation,
  description: data.description,
  ownerRole: data.ownerRole,
  type: data.type,
  ownerId: data.ownerId,
  status: "active",
  latitude: data.latitude,
  longitude: data.longitude,
});

const err = newJob.validateSync();
console.log("Validation Error:", err);
