import React, { useState } from 'react';
import { Paperclip, Send, X } from 'lucide-react';

const MessageInput = ({ onSend, loading }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    onSend && onSend({ text, image });
    setText("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  return (
    <form className="flex items-center gap-2 p-3 border-t bg-base-100" onSubmit={handleSend}>
      <label className="cursor-pointer flex items-center">
        <Paperclip className="h-5 w-5 text-base-content/70 mr-1" />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      </label>
      <input
        type="text"
        className="flex-1 input input-bordered rounded-full px-4 py-2 text-base-content bg-base-200 border-base-300 focus:outline-none"
        placeholder="Type a message..."
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={loading}
      />
      {imagePreview && (
        <div className="relative flex items-center">
          <img src={imagePreview} alt="preview" className="h-10 w-10 object-cover rounded mr-2 border border-base-300" />
          <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-base-100 rounded-full p-1 text-error hover:bg-error/10">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <button
        type="submit"
        className="btn btn-primary rounded-full px-4 py-2 flex items-center gap-1 disabled:opacity-60"
        disabled={loading || (!text.trim() && !image)}
      >
        <Send className="h-5 w-5" />
        <span className="hidden sm:inline">Send</span>
      </button>
    </form>
  );
};

export default MessageInput;