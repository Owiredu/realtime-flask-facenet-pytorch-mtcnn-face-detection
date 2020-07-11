# realtime-flask-facenet-pytorch-mtcnn-face-detection
Face detection using Flask and MTCNN (Multi Task Convolutional Neural Networks) from the facenet-pytorch module.

This project was motivated by this repository:<br> https://github.com/dxue2012/python-webcam-flask

# HOW TO RUN
<h3>WINDOWS</h3>
<ul>
  <li>
    Open the command line or terminal with the current directory set to the project directory.
  </li>
  <li>
    Run the command below to install the required modules:
    <br>
    <b>python -m pip install -r requirements.txt</b>
  </li>
  <li>
    Run the following commands in the exact order as displayed below:
    <br>
    <ol>
      <li>
        <b>set FLASK_APP=app.py</b>
      </li>
      <li>
        <b>flask run</b>
      </li>
    </ol>
  </li>
  <li>
    Open the url <i>http://127.0.0.1:5000</i> in a web browser.
  </li>
</ul>
<h4>OR</h4>
<ul>
  <li>
    Open the command line or terminal with the current directory set to the project directory.
  </li>
  <li>
    Run the <b>run_secure_loc_serv.cmd</b> file in the command prompt or powershell.
  </li>
  <li>
    Access the website using the url <b>https://&lt;your-ipv4-address&gt;:5000</b> on your local machine or any device on the same network.
    <b>&lt;your-ipv4-address&gt;</b> can be obtained with the <b>ipconfig</b> command in the command prompt or powershell.
  </li>
</ul>
<i><b>NB: Ignore the warning displayed by the web browser and proceed to the website</b></i>
<br>

<h3>LINUX</h3>
<ul>
  <li>
    Open the command line or terminal with the current directory set to the project directory.
  </li>
  <li>
    Run the command below to install the required modules:
    <br>
    <b>pip install -r requirements.txt</b>
    <br>
    OR
    <br>
    <b>pip3 install -r requirements.txt</b>
  </li>
  <li>
    Run the following commands in the exact order as displayed below:
    <br>
    <ol>
      <li>
        <b>export FLASK_APP=app.py</b>
      </li>
      <li>
        <b>flask run</b>
      </li>
    </ol>
  </li>
  <li>
    Open the url http://127.0.0.1:5000 in a web browser.
  </li>
</ul>
