Population Management Demo
==================

This project is our population management demo.  It starts with a disease overview (hierarchical circles) and, by hovering and clicking (on "High Cholesterol"; and "Chronic Kidney Disease" and "Type 2 Diabetes"), you get to patient group charts showing specific lab values.

For High Cholesterol we show individual patients' LDL levels, and identify problem patients.

For Diabetes+CKD, we show eGFR vs. HbA1c.

*Note:* To view the demo, you must navigate to the correct URL: http://0.0.0.0:5000/demo
(The root level of this project, usually accessed by http://0.0.0.0:5000/, is a sandbox that includes lots of charts we've been working on.)

Installation
-----------

Ensure you are using Python2.7.X:

    python --version  # => Python 2.7.2

Install pip, virtualenv and virtualenvwrapper if you haven't already

    sudo easy_install pip
    sudo pip install virtualenv virtualenvwrapper
    mkdir ~/.virtualenvs

Add the following to your ~/.profile or ~/.bash_profile:

    export WORKON_HOME=$HOME/.virtualenvs
    source /usr/local/bin/virtualenvwrapper.sh

Create a virtualenv for the project

    mkvirtualenv popman

virtualenvwrapper will have automatically activated the popman
virtualenv, meaning your shell prompt will look something like

    (popman)PPF0439-MB13:popman-dashboard alillie$

Whenever you open a new shell session and wish to work on the popman
project—for instance to run the server, open the shell or execute a fab
command—you will need to activate the popman virtualenv once more

    workon popman

Now, install Python dependencies into the virtualenv

    pip install -r requirements.txt

If you run into issues compiling numpy, scipy, or pandas, try setting the
following flags as appropriate:

        export CFLAGS="-arch i386 -arch x86_64"
        export FFLAGS="-m32 -m64"
        export LDFLAGS="-Wall -undefined dynamic_lookup -bundle -arch i386 -arch x86_64"
        export CC=gcc
        export CXX="g++ -arch i386 -arch x86_64"
        export ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future

Then, start the server:
	
	foreman start

Then visit http://0.0.0.0:5000/demo for the demo, or http://0.0.0.0:5000/ for the sandbox (a tabbed interface that includes lots of charts we've been working on).

We've only tested on Chrome, so no guarantees for other browsers.

Updating the Disease Hierarchy
-----------

If you want to update the disease hierarchy:
* edit (or replace)	data/disease_node_hierarchy_and_size.csv
* run data/translateToGraph.py (this writes a new data/disease_tree.json file)
* reload the vis

Data Sources
-----------
* **Cholesterol**: JavaScript-generated random data based on percentages in DS1
* **Population/Cholesterol**: JavaScript-generated random data based on percentages in DS1
* **Population/Diabetes**: */data/diabetes.csv*: John Schrom's fake data based on actual percentages in DS1
* **Diabetes and Renal**: */data/diabetes-creatinine.csv*: John Schrom's fake data based on actual percentages in DS1
* **Vaccinations**: */data/vaccinations.csv*: actual data from DS1 that includes Provider ID, patient-vaccination counts, and obfuscated dates (see */data/sql/vaccines.sql* for query)
* **Demo Disease Hierarchy**: The disease overview structure is defined by the data inside these files: */data/disease_node_hierarchy_and_size.csv*, */data/comorbid.csv*, and */data/disease_tree.json*.  The data for */data/disease_node_hierarchy_and_size.csv* and */data/comorbid.csv* is all __real__ aggregate counts from DS1, starting with SQL but then manipulated by hand.  To make changes to the disease tree, you should follow the instructions above (under "Updating the Disease Hierarchy").
