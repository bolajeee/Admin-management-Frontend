import React, { useState } from 'react';
import { Paperclip, Send, X } from 'lucide-react';

const MessageInput = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0) return;
    onSend && onSend({ text, images });
    setText("");
    setImages([]);
    setImagePreviews([]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImagePreviews(files.map(file => URL.createObjectURL(file)));
  };

  const removeImage = (idx) => {
    const newImages = images.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  return (
    <form className="flex items-center gap-2 p-3 border-t bg-base-100" onSubmit={handleSend}>
      <label className="cursor-pointer flex items-center">
        <Paperclip className="h-5 w-5 text-base-content/70 mr-1" />
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
      </label>
      <input
        type="text"
        className="flex-1 input input-bordered rounded-full px-4 py-2 text-base-content bg-base-200 border-base-300 focus:outline-none"
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={loading}
      />
      {imagePreviews.length > 0 && (
        <div className="flex items-center gap-1">
          {imagePreviews.map((preview, idx) => (
            <div key={idx} className="relative flex items-center">
              <img src={preview} alt="preview" className="h-10 w-10 object-cover rounded mr-2 border border-base-300" />
              <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-base-100 rounded-full p-1 text-error hover:bg-error/10">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="submit"
        className="btn btn-primary rounded-full px-4 py-2 flex items-center gap-1 disabled:opacity-60"
        disabled={loading || (!text.trim() && images.length === 0)}
      >
        <Send className="h-5 w-5" />
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
};

export default MessageInput;