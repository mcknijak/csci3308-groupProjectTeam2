#!/bin/bash

# Variable block

location="West US"
resourceGroup="myresourcegroup" # the resource group should already exist, replace with your own
server="ThreadBlend-db-main" # replace with your own server name, ensure it is globally unique
version="14" # the PostgreSQL version, currently 14 is the latest stable version
username="asemones" # replace with your own username
password="password" # replace with your own password

echo "Using resource group $resourceGroup with login: $username, password: $password..."

# Creates an Azure Database for PostgreSQL server
# The --sku-name, --tier, and --storage-size arguments define the compute and storage for our server
# Here we chose the Basic tier with 1 vCore, 2 GB of RAM and 32 GB of storage - the lowest possible cost

az postgres flexible-server create --location "$location" --resource-group $resourceGroup \
          --name $server --admin-user $username --admin-password $password --version $version \
          --sku-name Standard_B1ms --tier Burstable --storage-size 32 \
          --public-access all