上线步骤（Vercel 免费部署）：

1. 打开 https://vercel.com
2. 点右上角 "Sign Up" → 选择 "Continue with GitHub/GitLab/Email"
   推荐用 GitHub 登录，如果没有就注册一个（免费）

3. 登录后点 "Add New..." → "Project"

4. "Import Git Repository" 这里有两条路，选简单的那个：
   路 A：直接把整个 web/ 文件夹拖到 Vercel 页面上
   路 B：或者点 "Project" 后选 "Upload" 直接上传文件夹

5. 什么都不用改，直接点 "Deploy"

6. 等十几秒，完成后会给你一个链接，例如：
   https://douyin-copywriter.vercel.app

7. 打开这个链接，你的文案生成器就在线了

8. 发给客户时，把链接发过去就行


注意：
- DeepSeek API Key 已经写死在页面里，用户打开直接用
- 如果以后想换 API Key，重新上传 index.html 就行
- 如果担心 API Key 被盗用，可以在 DeepSeek 后台设置限额
