package ${packageName};

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import java.lang.reflect.Type;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

/**
 * @author Stephan Krusche (krusche@in.tum.de)
 * @version 2.0 (24.02.2019)
 *
 * This test evaluates if the specified attributes in the structure oracle
 * are correctly implemented with the expected types and visibility modifiers
 * (in case these are specified).
 */
@RunWith(Parameterized.class)
public class AttributeTest extends StructuralTest {

    public AttributeTest(String expectedClassName, String expectedPackageName, JSONObject expectedClassJSON) {
        super(expectedClassName, expectedPackageName, expectedClassJSON);
    }

    /**
     * This method collects the classes in the structure oracle file for which attributes are specified.
     * These classes are packed into a list, which represents the test data.
     * @return A list of arrays containing each class' name, package and the respective JSON object defined in the structure oracle.
     */
    @Parameterized.Parameters(name = "{0}")
    public static Collection<Object[]> findClasses() {
        List<Object[]> testData = new ArrayList<Object[]>();

        for (int i = 0; i < structureOracleJSON.length(); i++) {
            JSONObject expectedClassJSON = structureOracleJSON.getJSONObject(i);

            // Only test the classes that have attributes defined in the oracle.
            if(expectedClassJSON.has("class") && (expectedClassJSON.has("attributes") || expectedClassJSON.has("enumValues"))) {
                JSONObject expectedClassPropertiesJSON = expectedClassJSON.getJSONObject("class");
                String expectedClassName = expectedClassPropertiesJSON.getString("name");
                String expectedPackageName = expectedClassPropertiesJSON.getString("package");
                testData.add(new Object[]{ expectedClassName, expectedPackageName, expectedClassJSON });
            }
        }
        return testData;
    }

    /**
     * This test loops over the list of the test data generated by the method findClasses(), checks if each class is found
     * at all in the assignment and then proceeds to check its attributes.
     */
    @Test(timeout = 1000)
    public void testAttributes() {
        Class<?> observedClass = findClassForTestType("attribute");

        if(expectedClassJSON.has("attributes")) {
            JSONArray expectedAttributes = expectedClassJSON.getJSONArray("attributes");
            checkAttributes(observedClass, expectedAttributes);
        }
        if(expectedClassJSON.has("enumValues")) {
            JSONArray expectedEnumValues = expectedClassJSON.getJSONArray("enumValues");
            checkEnumValues(observedClass, expectedEnumValues);
        }
    }

    /**
     * This method checks if a observed class' attributes match the expected ones defined in the structure oracle.
     * @param observedClass: The class that needs to be checked as a Class object.
     * @param expectedAttributes: The information on the expected attributes contained in a JSON array. This information consists
     * of the name, the type and the visibility modifiers of each attribute.
     */
    private void checkAttributes(Class<?> observedClass, JSONArray expectedAttributes) {
        for(int i = 0; i < expectedAttributes.length(); i++) {
            JSONObject expectedAttribute = expectedAttributes.getJSONObject(i);
            String expectedName = expectedAttribute.getString("name");
            String expectedTypeName= expectedAttribute.getString("type");
            JSONArray expectedModifiers = expectedAttribute.has("modifiers") ? expectedAttribute.getJSONArray("modifiers") : new JSONArray();

            // We check for each expected attribute if the name and the type is right.
            boolean nameIsRight = false;
            boolean typeIsRight = false;
            boolean modifiersAreRight = false;

            for(Field observedAttribute : observedClass.getDeclaredFields()) {
                String observedName = observedAttribute.getName();
                String[] observedModifiers = Modifier.toString(observedAttribute.getModifiers()).split(" ");

                // If the names don't match, then proceed to the next observed attribute
                if(!expectedName.equals(observedName)) {
                    //TODO: we should also take wrong case and typos into account
                    continue;
                } else {
                    nameIsRight = true;
                }

                // Then check the parameters
                typeIsRight = checkType(observedAttribute, expectedTypeName);

                // And then the modifiers
                modifiersAreRight = checkModifiers(observedModifiers, expectedModifiers);

                // If all are correct, then we found our attribute and we can break the loop
                if(nameIsRight && typeIsRight && modifiersAreRight) {
                    break;
                }
            }

            String expectedAttributeInformation = "the expected attribute '" + expectedName + "' of the class '" + expectedClassName + "'";

            assertTrue("Problem: the name of " + expectedAttributeInformation + " is not implemented as expected.", nameIsRight);
            assertTrue("Problem: the type of " + expectedAttributeInformation + " is not implemented as expected.", typeIsRight);
            assertTrue("Problem: the modifiers (access type, abstract, etc.) of " + expectedAttributeInformation + " are not implemented as expected.", modifiersAreRight);
        }
    }

    /**
     * This method checks if the observed enum values match the expected ones defined in the structure oracle.
     * @param observedClass: The enum that needs to be checked as a Class object.
     * @param expectedEnumValues: The information on the expected enum values contained in a JSON array. This information consists
     * of the name of each enum value.
     */
    private void checkEnumValues(Class<?> observedClass, JSONArray expectedEnumValues) {
        Object[] observedEnumValues = observedClass.getEnumConstants();

        assertNotNull("Problem: the enum '" + expectedClassName + "' does not contain any enum constants. Please implement them.", observedEnumValues);

        assertTrue("Problem: the enum '" + expectedClassName + "' does not contain all the expected enum values. Please implement the missing enums.",
            expectedEnumValues.length() == observedEnumValues.length);

        for(int i = 0; i < expectedEnumValues.length(); i++) {
            String expectedEnumValue = expectedEnumValues.getString(i);

            boolean enumValueExists = false;
            for(Object observedEnumValue : observedEnumValues) {

                if(expectedEnumValue.equals(observedEnumValue.toString())) {
                    enumValueExists = true;
                    break;
                }
            }
            if(!enumValueExists) {
                fail("Problem: the class '" + expectedClassName + "' does not include the enum value: " + expectedEnumValue
                    + ". Make sure to implement it as expected.");
            }
        }
    }

    /**
     * This method checks if the type of an observed attribute matches the expected one.
     * It first checks if the type of the attribute is a generic one or not.
     * In the first case, it sees if the main and the generic types match, otherwise
     * it only looks up the simple name of the attribute.
     * @param observedAttribute: The observed attribute we need to check.
     * @param expectedTypeName: The name of the expected type.
     * @return True, if the types match, false otherwise.
     */
    protected boolean checkType(Field observedAttribute, String expectedTypeName) {
        boolean expectedTypeIsGeneric = expectedTypeName.contains("<") && expectedTypeName.contains(">");

        if(expectedTypeIsGeneric) {
            boolean mainTypeIsRight = false;
            boolean genericTypeIsRight = false;

            String expectedMainTypeName = expectedTypeName.split("<")[0];
            String observedMainTypeName = observedAttribute.getType().getSimpleName();
            mainTypeIsRight = expectedMainTypeName.equals(observedMainTypeName);

            String expectedGenericTypeName = expectedTypeName.split("<")[1].replace(">", "");
            if(observedAttribute.getGenericType() instanceof ParameterizedType) {
                Type observedGenericType = ((ParameterizedType) observedAttribute.getGenericType()).getActualTypeArguments()[0];
                String observedGenericTypeName = observedGenericType.toString().substring(observedGenericType.toString().lastIndexOf(".") + 1);
                genericTypeIsRight = expectedGenericTypeName.equals(observedGenericTypeName);
            }

            return mainTypeIsRight && genericTypeIsRight;
        } else {
            String observedTypeName = observedAttribute.getType().getSimpleName();
            return expectedTypeName.equals(observedTypeName);
        }
    }

}