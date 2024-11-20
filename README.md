# User-Center

## 配置ant designer pro 及umi ui

npm i @ant-design/pro-cli@3.1.0 -g

pro create myapp

yarn

yarn add @umijs/preset-ui -D

安装旧版本的pro-cli
[Ant Design Pro按照官网创建了项目，无法使用umi ui？来看看我废了半条命找出来的解决方案_ant design pro umi ui-CSDN博客](https://blog.csdn.net/weixin_45084490/article/details/140238133#:~:text=Ant Design)

[终极解决：Error: error:0308010C:digital envelope routines::unsupported-CSDN博客](https://blog.csdn.net/m0_48300767/article/details/131450325)

使用npm版本为`20.18.0`

设置淘宝镜像`npm config set registry https://registry.npmmirror.com`

恢复默认镜像`npm config set registry https://registry.npmjs.org`

![image-20241012151853649](README.assets/image-20241012151853649.png)

按照命令执行即可

快速删除node_model `rimfaf xxx`



![image-20241012152342256](README.assets/image-20241012152342256.png)

npm>16版本需要加`set NODE_OPTIONS=--openssl-legacy-provider`



访问不到umiUI的库在 hosts 文件 添加

```
151.101.64.133 raw.githubusercontent.com
```



对于淘宝镜像的证书过期，切换新地址没用

兄弟们，我解决了，记住这个包`getnpmregistry`，看下你们的`node_modules`下面的这个包，里面有个`registryMap`字段，里面配置了`taobao`源

```
const registryMap = {
  taobao: "https://registry.npmmirror.com/",
  npm: "https://registry.npmjs.org"
};
```

把`taobao`源改成`https://registry.npmmirror.com/`就可以了

⚠️注意下：如果你用的是`pnpm`你还要去`node_modules`下面的`.pnpm`目录下面找`getnpmregistry`这个包，看下里面的`taobao`源配置的对不对，有可能`node_modules/getnpmregistry/index.js`里面的配置和`node_modules/.pnpm/getnpmregistry@1.0.1/node_modules/getnpmregistry/index.js`的不一致

### 错误拦截器

D:\project\code\User-Center\user_center\node_modules\antd\lib\message

前端日志

1. 对于请求中的拦截问题，导致请求接口出现错误信息时，我们自己的拦截器会拦截一次，umi自带的拦截器也会拦截一次，由于我们自定义的响应类型与它默认的不一致，导致会弹出两个`message.error`,需要手动给接口跳过umi错误拦截器，后期如果接口过多再做修改。

```js
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.BaseResponse<API.CurrentUser>>('/api/user/current', {
    method: 'GET',
    skipErrorHandler: true,
    ...(options || {}),
  });
}
```

2. 当访问'/'路径时，由于NO_LOGIN_LIST中不包含此路径，导致会有未登录的提示，但如何在白名单中加入此路径，因为router的定义了这个路径重定向到'/welcome' 会导致直接进入系统，故在我们编写的响应拦截器中加入对此路径的判断。

   ```js
   if (res.code == 40100) {
     if (history.location.pathname !== '/') {
       message.error('请先登录');
     }
     history.replace({
       pathname: '/user/login',
       search: stringify({
         redirect: location.pathname,
       }),
     });
   } else {
     message.error(res.description);
   }
   ```

### Docker

#### 后端docker部署

Dockerfile

```dockerfile
FROM maven:3.5-jdk-8-alpine as builder

# Copy local code to the container image.
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Build a release artifact.
RUN mvn package -DskipTests

# Run the web service on container startup.
CMD ["java","-jar","/app/target/user-center-backend-0.0.1-SNAPSHOT.jar","--spring.profiles.active=prod"]
```

```cmd
docker build -t user-center-be:v0.0.1 .
```

![image-20241120140226084](C:\Users\92708\AppData\Roaming\Typora\typora-user-images\image-20241120140226084.png)

修改Docker的配置文件，添加可用镜像即可

参考：[docker镜像源地址配置_docker 镜像源地址-CSDN博客](https://blog.csdn.net/weixin_58069198/article/details/143357490)

```dockerfile
{
  "registry-mirrors": ["https://docker.registry.cyou",
"https://docker-cf.registry.cyou",
"https://dockercf.jsdelivr.fyi",
"https://docker.jsdelivr.fyi",
"https://dockertest.jsdelivr.fyi",
"https://mirror.aliyuncs.com",
"https://dockerproxy.com",
"https://mirror.baidubce.com",
"https://docker.m.daocloud.io",
"https://docker.nju.edu.cn",
"https://docker.mirrors.sjtug.sjtu.edu.cn",
"https://docker.mirrors.ustc.edu.cn",
"https://mirror.iscas.ac.cn",
"https://docker.rainbond.cc"]
}
```

```cmd
systemctl daemon-reload

systemctl restart docker
```

