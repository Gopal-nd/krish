'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LocateFixed, MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import WeatherComponent from '@/components/weather/detailsToday';
import HourlyWeatherData from '@/components/weather/Hourlydata';
import DailyForecast from '@/components/weather/DailyForcast';
import { useToast } from '@/hooks/use-toast';
import { WeatherData, WeatherDataHour } from '@/types/weather';
import { Skeleton } from '@/components/ui/skeleton';



const SkeletonPage = () => {

  const router = useRouter();


  return (

<div className='flex flex-col space-y-2'>
{/* Header with Back Button and Search */}
<div className='flex justify-between items-center px-4 w-[90%] mx-auto border-b pb-2'>
  <div className='flex gap-4'>
    <ArrowLeft className='h-5 w-5 hover:bg-slate-500 rounded-md' onClick={() => router.back()} />
    <div className='space-x-2 flex items-center'>
      <MapPin />
      <span><Skeleton className="h-5 w-32" /></span>
    </div>
  </div>
  <div>
    <div className="flex items-center">
      <LocateFixed className='mr-2 w-10 h-10 text-gray-300' />
      <Input type="text" placeholder="Search location..." disabled className="mr-2" />
      <Button size="icon" disabled>
        <Search className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>

{/* Location Access */}
<p className='text-center text-xl p-4'>Allow the Location access or <span className='text-green-500 font-bold'>Search a location</span></p>

{/* Loading Skeleton for Weather Component */}
<div className='w-[90%] mx-auto'>
  <Skeleton className="h-64 w-full rounded-md" />
</div>

{/* Loading Skeleton for Hourly Data */}
<div className='w-[90%] mx-auto mt-4'>
  <Skeleton className="h-32 w-full rounded-md" />
</div>

{/* Loading Skeleton for Daily Forecast */}
<div className='w-[90%] mx-auto mt-4'>
  <Skeleton className="h-48 w-full rounded-md" />
</div>
</div>

  );
};

export default SkeletonPage;
