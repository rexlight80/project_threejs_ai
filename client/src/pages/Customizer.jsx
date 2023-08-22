import React, {useState, useEffect, useRef} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnapshot } from 'valtio'
import config from '../config/config'
import state from '../store'
import {download} from '../assets'
import {DecalTypes, EditorTabs, FilterTabs} from '../config/constants'
import {slideAnimation, fadeAnimation} from '../config/motion'
import { downloadCanvasToImage, reader} from '../config/helpers'
import { AIPicker, ColorPicker, Tab, FilePicker, CustomButton} from '../components'

const Customizer = () => {
    const snap = useSnapshot(state);
    const[file, setFile] = useState('');
    const[prompt, setPrompt] = useState('');
    const[generatingImg, setGeneratingImg] = useState(false);
    const[activeEditorTab, setActiveEditorTab] = useState("");
    const[activeFilterTab, setActiveFilterTab] = useState({
        logoShirt:true,
        stylishShirt:false
    });
    const [open, setOpen] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
          if (!menuRef?.current?.contains(event.target)) {
            setOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
      }, [menuRef]);

    // show tab content depending on the activetab
    const generateTabContent = () => {
        switch(activeEditorTab) {
            case "colorpicker":
                return <ColorPicker/>
            case "filepicker":
                return <FilePicker
                         file={file}
                         setFile={setFile}
                         readFile={readFile}
                        />
            case 'aipicker':
                return <AIPicker
                         promp={prompt}
                         setPrompt={setPrompt}
                         generatingImg={generatingImg} 
                         handleSubmit={handleSubmit}
                         />
            default:
                return null;            
        }

    }

    const handleSubmit = async (type) => {
        if(!prompt) alert('Please enter a prompt');

        try {
            //call our backend to generate ai image
            setGeneratingImg(true)
            const response = await fetch('http://localhost:8080/api/v1/dalle', {
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    prompt
                })
            });

            const data = await response.json();

            handleDecals(type, `data:image/png;base64,${data.photo}`);
            
        } catch (error) {
            alert(error);
        } finally {
            setGeneratingImg(false);
            setActiveEditorTab("");
        }
    }

    const handleDecals = (type, result) =>{
        const decalType = DecalTypes[type];
        state[decalType.stateProperty] = result;

        if(!activeFilterTab[decalType.filterTab]){
            handleActiveFilterTab(decalType.filterTab);
        }
    }

    const handleActiveFilterTab = (tabName) => {
        switch (tabName) {
            case "logoShirt":
                  state.isLogoTexture = !activeFilterTab[tabName]
                break;
            case "stylishShirt":
                  state.isFullTexture = !activeFilterTab[tabName]
                  break;    
        
            default:
                state.isLogoTexture = true;
                state.isFullTexture = false;
           }

           // after setting the state, activeFilterTab is updated

           setActiveFilterTab((prevState) => {
              return {
                 ...prevState,
                 [tabName]:!prevState[tabName]
              }
           })
        }

    const readFile = (type) => {
        reader(file)
          .then((result) => {
            handleDecals(type, result);
            setActiveEditorTab("")

          })
    }

  return (
   <AnimatePresence>
       {!snap.intro && (
           <>
             <motion.div
               key="custom"
               className='absolute top-0 left-0 z-10'
               {...slideAnimation('left')}
             >
                 <div ref={menuRef} className='flex items-center min-h-screen'>
                    <div className='editortabs-container tabs'>
                          {EditorTabs.map((tab) => (
                                <Tab
                                 key={tab.name}
                                 tab={tab}
                                 handleClick={() => {
                                    setActiveEditorTab(tab.name);
                                    setOpen(true);
                                }}
                                />
                          ))}
                          {open && generateTabContent()}
                    </div>

                 </div>
             </motion.div>
             <motion.div
               className='absolute z-10 top-5 right-5'
               {...fadeAnimation}
             >
                <CustomButton 
                  type='filled'
                  title='Go Back'
                  handleClick={() => state.intro = true}
                  customStyles="w-fit px-4 py-2.5 font-bold text-sm"
                />

             </motion.div>
             <motion.div
               className='filtertabs-container'
               {...slideAnimation('up')}
             >
                  {FilterTabs.map((tab) => (
                      <Tab
                        key={tab.name}
                        tab={tab}
                        isFilterTab
                        isActivetab={activeFilterTab[tab.name]}
                        handleClick={() => handleActiveFilterTab(tab.name)}
                      />))}

             </motion.div>
           </>        
       )} 
   </AnimatePresence>
  )
}

export default Customizer