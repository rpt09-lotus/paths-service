FROM ubuntu:16.04

# copy files from current folder to images app folder
# why make a new app directory in our image?
# (optional) we make an app folder in our container so we can avoid all the root level messy mess
RUN mkdir app
COPY . ./app
WORKDIR app

# install psql
RUN apt-get update \
  && apt-get install -y postgresql postgresql-contrib \
  && apt-get install sudo \
  && sudo apt-get install -y software-properties-common \
  && sudo apt-get update -y \
  && sudo apt-get upgrade -y \
  && sudo apt-get dist-upgrade -y \
  && sudo apt-get purge nodejs npm -y \
  && sudo apt-get install curl \
  && apt-get install -y apt-transport-https \
  && sudo apt-get install -y git \
  && sudo apt-get install -y build-essential \
  && sudo apt-get install -y libgles2-mesa-dev \
  && curl -sL https://deb.nodesource.com/setup_8.x | bash - \
  && apt-get -y install nodejs \
  && apt-get -y install xvfb

# install npm
ENV NODE_ENV='production'
RUN npm install
ENV LD_PRELOAD='/app/node_modules/sharp/vendor/lib/libz.so'
ENV PORT=80
ENV HOST='localhost'
ENV DB_USER='docker'
ENV DB_NAME='9trails-paths'
ENV DB_PASS='docker'
ENV ABS_PATH_TO_DB_FOLDER='/app/db'
ENV DB_TYPE='postgres'

#expose pg + node
EXPOSE 80 5432
# run our shell script
CMD start-stop-daemon --start --pidfile ~/xvfb.pid --make-pidfile --background --exec /usr/bin/Xvfb -- :99 -screen 0 1024x768x24 -ac +extension GLX +render -noreset \
&& sleep 5 \
&& export DISPLAY=:99.0 \
&&/etc/init.d/postgresql start \
&& sudo -u postgres psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" \
&& sudo -u postgres createdb -O docker 9trails-paths \
&& sudo PGPASSWORD='docker' -u postgres psql -d 9trails-paths -U docker -h 127.0.0.1 -p 5432 \
&& node db/seedMill.js \
&& node server/index.js
