import React from "react";
import "codemirror/lib/codemirror.css";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";
import { Button } from "antd";
const Markdown = () => {

    const editorRef = React.createRef();
    function onChange(source, data){
        console.log(source, data)
    }

    function getData(){
        console.log(editorRef.current.getInstance().getMarkdown(), editorRef.current.getInstance().getHtml())
    }


  return (
    <>
    <Editor
      ref={editorRef}
      placeholder="请输入正文"
      previewStyle="vertical"
      height="330px"
      initialEditType="markdown"
      useCommandShortcut={true}
      width="463px" 
      onChange={onChange}

      
      config={
        {
            markdown: // testEditor.getMarkdown().replace(/`/g, '\\`')
            `## Test
            \`\`\`
            console.log('what can i do for you')
            \`\`\`

            # 123123`,
            onload: (editor, func) => {
                let md = editor.getMarkdown();
                let html = editor.getHTML();
                debugger
            }
        }
    }
    />
    <Button onClick={getData}>123</Button>
    </>
  );
};

export default Markdown;