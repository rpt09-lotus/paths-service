FROM node:8.9.4

# copy files from current folder to images app folder
# why make a new app directory in our image?
# (optional) we make an app folder in our container so we can avoid all the root level messy mess
RUN mkdir app
COPY . ./app
WORKDIR app

# install psql
RUN apt-get update \
  && apt-get install -y postgresql postgresql-contrib \
  && apt-get install sudo
# install npm
ENV NODE_ENV=production
RUN npm install
#expose pg + node
EXPOSE 80 5432
# run our shell script
CMD /etc/init.d/postgresql start \
&& sudo -u postgres psql --command "CREATE USER docker WITH SUPERUSER PASSWORD 'docker';" \
&& sudo -u postgres createdb -O docker 9trails-paths \
&& sudo PGPASSWORD='docker' -u postgres psql -d 9trails-paths -U docker -h 127.0.0.1 -p 5432 < db/schema.sql \
&& node server/index.js