

node_modules: package.json
	@if ! [ $(shell which npm 2> /dev/null) ]; then \
		echo "npm is not installed https://npmjs.com"; \
		exit 1; \
	fi

	@echo Getting Javascript dependencies
	@npm install

e2e-android:
	# @for PID in $$(ps -ef | grep "appium" | awk '{ print $$2 }'); do \
	# 	echo Stopping Appium server at pid:$$PID; \
	# 	kill $$PID; \
	# done

	@echo E2E: Running tests on Android

	@npm run appium

	# @./node_modules/.bin/appium --port 4995 > appium.log & echo $! > appium-server.pid
	# @sleep 10
	@echo E2E: Appium started

	@./node_modules/.bin/tape ./android/index.js | ./node_modules/.bin/tap-spec
	@echo E2E: Tape started

	# @for PID in $$(ps -ef | grep "appium" | awk '{ print $$2 }'); do \
	# 	echo Stopping Appium server at pid:$$PID; \
	# 	kill $$PID; \
	# done

	@killport 4995

    
