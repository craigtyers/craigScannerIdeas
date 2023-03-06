#!/bin/bash
CONTAINER_NAME=${1:-"wcag_scanner"}
NETWORK_NAME=${2:-"development-network"}
USER_GID=${3:-"1000"}
CONFIG_ROOT=${4:-"configs/development"}
WORK_DIR=$(pwd)
SET_DIR=$5
MOUNT_ROOT=${SET_DIR:=$WORK_DIR}
OTHER_ARGS=${6:-""}

docker run --name $CONTAINER_NAME -it -d --user $USER_GID:$USER_GID $OTHER_ARGS \
	--mount type=bind,source="$MOUNT_ROOT",target="/app" \
	--network $NETWORK_NAME \
	--env CONFIG_ROOT="$CONFIG_ROOT" \
	--add-host="queue.reciteme.local:host-gateway" \
	$CONTAINER_NAME \
	npm run watch
