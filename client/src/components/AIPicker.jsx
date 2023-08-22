import React from 'react'
import CustomButton from './CustomButton'

const AIPicker = ({prompt, setPrompt, generatingImg, handleSubmit}) => {
  return (
    <div className='aipicker-container'>
        <textarea
          placeholder='Ask AI...'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className='aipicker-textarea'
        />
        <div className='flex flex-wrap gap-3'>
            {generatingImg ? (
               <CustomButton
                  type='outline'
                  title="Asking AI..."
                  customStyles="text-xs"
               />
            ):(
                <>
                <CustomButton
                  type='outline'
                  title="AI Logo"
                  customStyles="text-xs"
                  handleClick={() => handleSubmit('logo')}
               />
                <CustomButton
                  type='filled'
                  title="AI Full"
                  customStyles="text-xs"
                  handleClick={() => handleSubmit('full')}
               />
              </>
            )}
        </div>

    </div>
  )
}

export default AIPicker