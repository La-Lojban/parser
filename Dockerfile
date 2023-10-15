FROM ubuntu:focal

RUN apt-get update 

# set timezone to avoid questions in CLI 
ENV TZ=Europe/London
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# install common
RUN apt-get install -y vim bash curl wget gnupg2 lsof zip unzip

# install python
RUN apt-get install -y python3 python3-pip

# install pdf-related
RUN apt-get install -y ghostscript

# install nodejs
RUN set -uex; \
    apt-get update; \
    apt-get install -y ca-certificates curl gnupg; \
    mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
     | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
    NODE_MAJOR=20; \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
     > /etc/apt/sources.list.d/nodesource.list; \
    apt-get update; \
    apt-get install nodejs -y;
RUN npm i -g yarn

# install fonts
RUN apt-get install -y fonts-noto-color-emoji fonts-freefont-ttf

# cleanup
RUN apt-get autoclean && rm -rf /var/lib/apt/lists/*

#create workspace
RUN mkdir -p /app/src
WORKDIR /app

COPY *.json /app/
COPY *.lock /app/
COPY *.ts /app/
COPY *.md /app/

RUN yarn
