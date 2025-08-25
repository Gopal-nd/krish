import Image from 'next/image'
import React from 'react'

interface ProfileCardProps {
  name: string
  email: string
  username: string
  image: string
  id: string
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, username, image, id }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg p-10 border">
      <Image className="w-full  object-cover rounded-full" width={200} height={200} src={image} alt={`${name}'s profile picture`} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{name}</div>
        <p className="text-gray-700 text-base">@{username}</p>
        <p className="text-gray-700 text-base">{email}</p>
        {/* {id && <p className="mt-2 text-gray-600 text-sm">{id}</p>} */}
      </div>
      <div className="px-6 pt-4 pb-2">
        <span className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#user</span>
        <span className="inline-block bg-green-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#profile</span>
      </div>
    </div>
  )
}

export default ProfileCard
