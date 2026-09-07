import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, VolumeX } from 'lucide-react';

const VideoControls = ({ isMicOn, isVideoOn, isAudioOn, onToggleMic, onToggleVideo, onToggleAudio, onEndCall, disabled = false }) => (
  <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm px-6 py-4 rounded-xl shadow-2xl">
    <div className="flex items-center justify-center gap-4">
      <button onClick={onToggleMic} disabled={disabled} className={`p-4 rounded-full transition-all transform hover:scale-110 ${isMicOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`} title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}>{isMicOn ? <Mic className="w-6 h-6"/> : <MicOff className="w-6 h-6"/>}</button>
      <button onClick={onToggleVideo} disabled={disabled} className={`p-4 rounded-full transition-all transform hover:scale-110 ${isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-500 text-white'}`} title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}>{isVideoOn ? <Video className="w-6 h-6"/> : <VideoOff className="w-6 h-6"/>}</button>
      <button onClick={onToggleAudio} disabled={disabled} className={`p-4 rounded-full transition-all transform hover:scale-110 ${isAudioOn ? 'bg-gray-700 text-white' : 'bg-orange-500 text-white'}`} title={isAudioOn ? 'Mute AI Voice' : 'Unmute AI Voice'}>{isAudioOn ? <Volume2 className="w-6 h-6"/> : <VolumeX className="w-6 h-6"/>}</button>
      <button onClick={onEndCall} disabled={disabled} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110" title="End Interview"><PhoneOff className="w-6 h-6"/></button>
    </div>
  </div>
);

export default VideoControls;
