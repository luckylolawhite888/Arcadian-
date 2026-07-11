// ============================================================
// OUT & ABOUT — USER APP (Consumer Side) v2
// React Native / Expo with Supabase Backend support
// ============================================================

import { StatusBar } from 'expo-status-bar';

// ─── Supabase Setup ───
const SUPABASE_URL = 'https://mdleurcenwmmenvkwjhl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_mPjat_GLHfK1TwzPxEa2tQ_OvutOgDL';
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Theme ───
const theme = {
  bg: '#0D0D0D', card: '#1A1A1A', card2: '#222222',
  border: '#2C2C2C', orange: '#FF5C00', orange2: '#FF8C42',
  text: '#F0EAE0', muted: '#777777', green: '#2ECC71',
  red: '#E74C3C', yellow: '#F5C518', blue: '#4A9EFF',
};

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

function fmtTimeLeft(ms) {
  if (ms <= 0) return 'Ended';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function getDealTypeInfo(type) {
  return {
    end_of_day: { label: 'End of Day', emoji: '🔴', color: theme.red },
    flash_sale: { label: 'Flash Sale', emoji: '🟡', color: theme.yellow },
    ongoing: { label: 'Ongoing', emoji: '🟢', color: theme.green },
    seasonal: { label: 'Seasonal', emoji: '🔵', color: theme.blue },
  }[type] || { label: 'Deal', emoji: '🎉', color: theme.orange };
}

import React, { useState, useEffect, createContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, FlatList, Share, ActivityIndicator,
  RefreshControl, Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const AppContext = createContext({});

function buildSampleDeals() {
  return [
    { id:'1', emoji:'☕', title:'Free Pastry with Any Coffee', shop_name:'The Coffee Spot', address:'12 High Street, NW10', category:'cafe', deal_type:'flash_sale', description:'Grab any hot or iced coffee today and get a free pastry on us. Today only!', distance:'0.2mi', distanceNum:0.2, timerSecs:2832, original_price:6.00, discount_percent:50, discount_price:3.00, currency:'GBP', bgColor:'#1a0f00', daily_limit:50, redeemed_count:6, referral_reward_type:'item', referral_reward:'Free coffee next visit', urgency:'high', lat:51.5322, lng:-0.2356 },
    { id:'2', emoji:'✂️', title:'50% Off All Haircuts', shop_name:'Blades Barbers', address:'8 Market Lane, NW10', category:'barber', deal_type:'flash_sale', description:'Flash sale on all cuts — buzz, fade, or full style.', distance:'0.4mi', distanceNum:0.4, timerSecs:4324, original_price:25.00, discount_percent:50, discount_price:12.50, currency:'GBP', bgColor:'#0a1a0a', daily_limit:20, redeemed_count:3, urgency:'medium', lat:51.5318, lng:-0.2341 },
    { id:'3', emoji:'🍕', title:'Buy 1 Get 1 Free Pizza Slices', shop_name:'Slice & Dice', address:'22 High Street, NW10', category:'restaurant', deal_type:'ongoing', description:'Happy hour is on. Buy one slice, get one free.', distance:'0.6mi', distanceNum:0.6, timerSecs:13500, bgColor:'#0d0d1a', daily_limit:100, redeemed_count:11, referral_reward_type:'discount', referral_reward:'10% off next order', urgency:'low', lat:51.5310, lng:-0.2370 },
    { id:'4', emoji:'💆', title:'30% Off All Treatments', shop_name:'Serenity Beauty', address:'5 Park Road, NW10', category:'beauty', deal_type:'end_of_day', description:'30% off facials, massages, manicures.', distance:'0.8mi', distanceNum:0.8, timerSecs:19200, original_price:60.00, discount_percent:30, discount_price:42.00, currency:'GBP', bgColor:'#1a0a0a', daily_limit:10, redeemed_count:4, urgency:'low', lat:51.5330, lng:-0.2380 },
    { id:'5', emoji:'👟', title:'20% Off All Footwear', shop_name:'StepUp Shoes', address:'40 High Street, NW10', category:'retail', deal_type:'ongoing', description:'Weekend-only on our entire footwear range.', distance:'1.1mi', distanceNum:1.1, timerSecs:28800, original_price:45.00, discount_percent:20, discount_price:36.00, currency:'GBP', bgColor:'#0a0d1a', daily_limit:30, redeemed_count:9, urgency:'low', lat:51.5305, lng:-0.2345 },
  ];
}