<svelte:head>
	<title>Contact me</title>
</svelte:head>

<h1>Contact Me</h1>
<form method="GET" name="email-form">
    
    <label for="subject">Subject:</label> 
    <input type="text" id="subject" name="subject" required>
    
    <label for="body">Message:</label>
    <textarea type="body" id="body" name="body" required></textarea>
    
    <input type="submit" value="Submit">
</form>